
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
// Tạo booking mới
// Xoá booking theo bookingId

/**
 * Chỉ host sở hữu phòng hoặc admin mới được duyệt/từ chối
 */
async function assertCanModerateBooking(req, booking) {
  if (!booking) {
    const err = new Error('Booking không tồn tại');
  // @ts-ignore
    err.statusCode = 404;
    throw err;
  }
  // Lấy phòng theo roomId (kiểu String)
  const room = await Room.findOne({ roomId: booking.roomId }).select('hostId roomId roomTitle price');
  if (!room) {
    const err = new Error('Phòng của booking không tồn tại');
  // @ts-ignore
    err.statusCode = 404;
    throw err;
  }
  // Admin được phép duyệt tất cả
  if (req.user.role === 'admin') return room;
  // Host chỉ được duyệt phòng của mình
  if (req.user.role === 'host' && room.hostId === req.user.userId) return room;

  const err = new Error('Bạn không có quyền duyệt booking này');
  // @ts-ignore
  err.statusCode = 403;
  throw err;
}

/**
 * PUT /bookings/:id/approve
 * Quyền: host (sở hữu phòng) | admin
 * Body (tuỳ chọn): { note: string }
 */
exports.approveBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const note = (req.body?.note || '').toString().trim();

    const booking = await Booking.findById(id);
    const room = await assertCanModerateBooking(req, booking);

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Booking đang ở trạng thái '${booking.status}', không thể duyệt`,
      });
    }

    booking.status = 'approved';
    if (note) booking.note = note;
    await booking.save();

   
     await Room.updateOne({ roomId: booking.roomId }, { status: 'Waiting' });

    return res.status(200).json({
      success: true,
      message: 'Duyệt booking thành công',
      data: {
        ...booking.toObject(),
        roomInfo: {
          roomId: room.roomId,
          roomTitle: room.roomTitle,
          price: room.price.value,
        },
      },
    });
  } catch (err) {
    console.error('approveBooking error:', err);
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /bookings/:id/reject
 * Quyền: host (sở hữu phòng) | admin
 * Body (tuỳ chọn): { reason: string }
 */
exports.rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const reason = (req.body?.reason || '').toString().trim();

    const booking = await Booking.findById(id);
    const room = await assertCanModerateBooking(req, booking);

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Booking đang ở trạng thái '${booking.status}', không thể từ chối`,
      });
    }

    booking.status = 'rejected';
    if (reason) {
      // lưu lý do vào note để FE xem được (hoặc tạo field riêng ví dụ rejectReason)
      booking.note = booking.note ? `${booking.note}\n[Reject] ${reason}` : `[Reject] ${reason}`;
    }
    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Từ chối booking thành công',
      data: {
        ...booking.toObject(),
        roomInfo: {
          roomId: room.roomId,
          roomTitle: room.roomTitle,
        },
      },
    });
  } catch (err) {
    console.error('rejectBooking error:', err);
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const actor = req.user;

    // Tìm booking
    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking không tồn tại' });
    }

    const isHostOrAdmin = actor.role === 'host' || actor.role === 'admin';
    const isTenant = actor.role === 'tenant';

    // Nếu là tenant, phải là chủ booking và chưa approved
    if (isTenant) {
      if (booking.tenantId !== actor.userId) {
        return res.status(403).json({ success: false, message: 'Không thể xoá booking của người khác' });
      }
      if (booking.status === 'approved') {
        return res.status(400).json({ success: false, message: 'Không thể xoá booking đã được duyệt' });
      }
    } else if (!isHostOrAdmin) {
      return res.status(403).json({ success: false, message: 'Không có quyền xoá booking' });
    }

    await booking.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Xoá booking thành công',
      data: { bookingId }
    });
  } catch (err) {
    console.error('deleteBooking error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { roomId, startDate, endDate, note } = req.body;

    // Lấy user từ token
    const user = req.user;

    // Kiểm tra vai trò là tenant
    if (user.role !== 'tenant') {
      return res.status(403).json({ success: false, message: 'Chỉ tenant mới được đặt phòng' });
    }

    // Kiểm tra roomId có tồn tại trong Room không
    const room = await Room.findOne({ roomId }); // roomId là mã phòng riêng
    if (!room) {
      return res.status(404).json({ success: false, message: 'Phòng không tồn tại' });
    }

    const existed = await Booking.findOne({
      roomId,
      tenantId: user.userId,                 
      status: { $in: ['pending'] }  
    }).lean();

    if (existed) {
      return res.status(409).json({
        success: false,
        message: 'Bạn đã có một booking đang hiệu lực cho phòng này'
      });
    }
    // Tạo mã bookingId ngẫu nhiên
    const bookingId = `BKG-${uuidv4().slice(0, 8)}`;

    // Tạo bản ghi booking mới
    const newBooking = await Booking.create({
      bookingId,
      roomId,
      tenantId: user.userId, // lấy userId từ token
      startDate,
      endDate,
      note,
    });

    res.status(201).json({
      success: true,
      message: 'Đặt phòng thành công',
      data: newBooking,
    });
  } catch (error) {
    console.error('[ERROR]', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
// Lấy tất cả bookings (admin)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('roomId', 'roomId title')
      .populate('tenantId', 'name email');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.getHostBookings = async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 200);
    const skip  = (page - 1) * limit;

    const { status, from, to } = req.query;

    // Xác định hostId: host tự xem của mình; admin có thể xem hộ qua ?hostId=
    const hostId =
      req.user.role === 'admin'
        ? (req.query.hostId || null)
        : req.user.userId;

    if (!hostId) {
      return res.status(400).json({ success: false, message: 'hostId is required' });
    }

    // 1) Lấy roomId của các phòng thuộc host
    const rooms = await Room.find({ hostId }).select('roomId roomTitle location price images status');
    if (!rooms || rooms.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [], pagination: { page, limit, total: 0 } });
    }
    const roomIds = rooms.map(r => r.roomId);
    const roomMap = new Map(rooms.map(r => [r.roomId, r]));

    // 2) Lọc booking theo roomIds + điều kiện phụ
    const filter = { roomId: { $in: roomIds } };
    if (status) filter.status = status;

    // Lọc theo khoảng thời gian: ưu tiên khoảng startDate–endDate
    // - Nếu chỉ có from: startDate >= from
    // - Nếu chỉ có to:   endDate   <= to
    // - Nếu có cả 2:     startDate >= from && endDate <= to
    if (from) {
      const fromDate = new Date(from);
      if (!isNaN(+fromDate)) {
        filter.startDate = { ...(filter.startDate || {}), $gte: fromDate };
      }
    }
    if (to) {
      const toDate = new Date(to);
      if (!isNaN(+toDate)) {
        filter.endDate = { ...(filter.endDate || {}), $lte: toDate };
      }
    }

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // 3) Gắn roomInfo tối thiểu để FE hiển thị
    const data = bookings.map(b => {
      const obj = b.toObject({ getters: true });
      return {
        ...obj,
        roomInfo: roomMap.get(b.roomId) ? {
          roomId: roomMap.get(b.roomId).roomId,
          roomTitle: roomMap.get(b.roomId).roomTitle,
          location: roomMap.get(b.roomId).location,
          price: roomMap.get(b.roomId).price,
          images: roomMap.get(b.roomId).images,
          status: roomMap.get(b.roomId).status,
        } : null
      };
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
      pagination: { page, limit, total }
    });
  } catch (err) {
    console.error('getHostBookings error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
// Lấy các bookings của người thuê hiện tại
exports.getMyBookings = async (req, res) => {
  try {
    const myBookings = await Booking.find({ tenantId: req.user.userId })
      .populate('roomId', 'roomId title');

    res.status(200).json({
      success: true,
      count: myBookings.length,
      data: myBookings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Cập nhật trạng thái booking theo bookingId 
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { bookingStatus } = req.body;

    

    const booking = await Booking.findOneAndUpdate(
      { bookingId },
      { $set: { bookingStatus, updatedAt: new Date() } },
      { new: true, runValidators: true, context: 'query' }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking không tồn tại' });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái booking thành công',
      data: booking
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};
