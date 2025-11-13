const Contract = require('../models/Contract');
const Room = require('../models/Room');
const User = require('../models/User');
const Booking = require('../models/Booking');

exports.checkActiveContractForSelf = async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!roomId) {
      return res.status(400).json({ success: false, message: 'Thiếu roomId' });
    }

    // Lấy userId từ token (tuỳ middleware của bạn đặt là userId hay id)
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Không xác thực được user' });
    }

    const now = new Date();
    const contract = await Contract.findOne({
      roomId,
      tenantId: userId,
      status: { $in: ['active', 'expired', 'terminated'] },
      startDate: { $lte: now },
      endDate:   { $gte: now },
    }).lean();

    if (!contract) {
      return res.json({
        success: true,
        active: false,
        data: null
      });
    }

    // Trả về thông tin rút gọn để FE/BE dùng tiếp
    const { contractId, startDate, endDate, status, bookingId } = contract;
    return res.json({
      success: true,
      active: true,
      data: { contractId, bookingId, roomId, tenantId: userId, startDate, endDate, status }
    });
  } catch (err) {
    console.error('checkActiveContractForSelf error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * GET /api/contracts/host
 * Lấy hợp đồng theo hostId (hostId lấy từ token).
 * - host: chỉ xem hợp đồng của các phòng mình sở hữu
 * - admin: có thể truyền ?hostId=... để xem hộ, nếu không truyền thì dùng userId của mình
 * Hỗ trợ filter: status, roomId, tenantId, contractId; phân trang: page, limit
 */
exports.getContractsByHost = async (req, res) => {
  try {
    // role check
    if (!['host', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Chỉ host hoặc admin được phép' });
    }

    // hostId lấy từ token; admin có thể override qua query
    const qHostId = req.query.hostId;
    const hostId = req.user.role === 'host' ? req.user.userId : (qHostId || req.user.userId);

    // paging
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 200);
    const skip = (page - 1) * limit;

    // filters
    const { status, roomId, tenantId, contractId } = req.query;

    // pipeline:
    // 1) bắt đầu từ Contract
    // 2) join Room theo roomId
    // 3) match room.hostId === hostId + các filter khác
    // 4) join User (tenant) + Booking
    // 5) project các field cần thiết
    // 6) sort + paginate (facet)
    const pipeline = [
      // join Room
      {
        $lookup: {
          from: 'rooms',
          localField: 'roomId',
          foreignField: 'roomId',
          as: 'room',
        },
      },
      { $unwind: '$room' },

      // filter theo host và các tiêu chí
      {
        $match: {
          'room.hostId': hostId,
          ...(status ? { status } : {}),
          ...(roomId ? { roomId } : {}),
          ...(tenantId ? { tenantId } : {}),
          ...(contractId ? { contractId } : {}),
        },
      },

      // join tenant
      {
        $lookup: {
          from: 'users',
          localField: 'tenantId',
          foreignField: 'userId',
          as: 'tenant',
          pipeline: [
            { $project: { _id: 0, userId: 1, fullName: 1, email: 1, phone: 1 } },
          ],
        },
      },
      { $unwind: { path: '$tenant', preserveNullAndEmptyArrays: true } },

      // join booking
      {
        $lookup: {
          from: 'bookings',
          localField: 'bookingId',
          foreignField: 'bookingId',
          as: 'booking',
          pipeline: [
            { $project: { _id: 0, bookingId: 1, startDate: 1, endDate: 1, status: 1 } },
          ],
        },
      },
      { $unwind: { path: '$booking', preserveNullAndEmptyArrays: true } },

      // project
      {
        $project: {
          _id: 0,
          contractId: 1,
          bookingId: 1,
          roomId: 1,
          tenantId: 1,
          startDate: 1,
          endDate: 1,
          duration: 1,
          rentPrice: 1,
          terms: 1,
          note: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          roomInfo: {
            roomId: '$room.roomId',
            roomTitle: '$room.roomTitle',
            location: '$room.location',
            price: '$room.price',
            images: '$room.images',
            hostId: '$room.hostId',
          },
          tenantInfo: '$tenant',
          bookingInfo: '$booking',
        },
      },

      // sort mới nhất
      { $sort: { createdAt: -1 } },

      // facet: tách total + data trang
      {
        $facet: {
          total: [{ $count: 'count' }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
      {
        $project: {
          data: 1,
          total: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] },
        },
      },
    ];

    const agg = await Contract.aggregate(pipeline);
    const first = agg[0] || { data: [], total: 0 };
    const total = first.total || 0;
    const data = first.data || [];

    return res.status(200).json({
      success: true,
      data: {
        contracts: data,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalContracts: total,
        },
      },
    });
  } catch (error) {
    console.error('[getContractsByHost] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy hợp đồng theo host',
      error: error.message,
    });
  }
};

exports.getContractsByTenant = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 200);
    const skip = (page - 1) * limit;

    const { status } = req.query;

    // Nếu là tenant: chỉ được xem hợp đồng của chính mình
    // Nếu là host/admin: có thể truyền ?tenantId=... để xem hộ
    const qTenantId = req.query.tenantId;
    const tenantId =
      req.user.role === 'tenant'
        ? req.user.userId
        : (qTenantId || req.user.userId); // host/admin có thể bỏ trống -> xem theo userId của họ nếu muốn

    // Tenant KHÔNG được xem người khác
    if (req.user.role === 'tenant' && qTenantId && qTenantId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Không có quyền xem hợp đồng của người khác' });
    }

    const filter = { tenantId };
    if (status) filter.status = status;

    const [total, contracts] = await Promise.all([
      Contract.countDocuments(filter),
      Contract.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    // Populate thủ công roomInfo + bookingInfo
    const roomIds = [...new Set(contracts.map(c => c.roomId))];
    const bookingIds = [...new Set(contracts.map(c => c.bookingId).filter(Boolean))];

    const [rooms, bookings] = await Promise.all([
      Room.find({ roomId: { $in: roomIds } })
        .select('roomId roomTitle location price images hostId')
        .lean(),
      Booking.find({ bookingId: { $in: bookingIds } })
        .select('bookingId startDate endDate status')
        .lean()
    ]);

    const roomMap = new Map(rooms.map(r => [r.roomId, r]));
    const bookingMap = new Map(bookings.map(b => [b.bookingId, b]));

    const data = contracts.map(c => ({
      ...c,
      roomInfo: roomMap.get(c.roomId) || null,
      bookingInfo: bookingMap.get(c.bookingId) || null
    }));

    return res.status(200).json({
      success: true,
      data: {
        contracts: data,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalContracts: total
        }
      }
    });
  } catch (error) {
    console.error('[getContractsByTenant] Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy hợp đồng theo tenant', error: error.message });
  }
};
// Tạo hợp đồng mới
exports.createContract = async (req, res, next) => {
  try {
    const { roomId, tenantId, duration, rentPrice, terms, startDate, endDate, bookingId } = req.body;

    // // Log request đầu vào
    // console.log('[DEBUG] Dữ liệu yêu cầu:', { roomId, tenantId, duration, rentPrice, terms, startDate });
    // console.log('[DEBUG] Thông tin người dùng hiện tại:', req.user);

    // Kiểm tra phòng có tồn tại không
    const room = await Room.findOne({ roomId });
    if (!room) {
      console.log(`[ERROR] Không tìm thấy phòng với roomId: ${roomId}`);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    // Kiểm tra người thuê có tồn tại không
    const tenant = await User.findOne({ userId: tenantId });
    if (!tenant) {
      //   console.log(`[ERROR] Không tìm thấy người thuê với userId: ${tenantId}`);
      return res.status(404).json({
        success: false,
        message: 'Người thuê không tồn tại'
      });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && room.hostId !== req.user.userId) {
      //   console.log(`[ERROR] Người dùng không có quyền tạo hợp đồng. Role: ${req.user.role}, HostID: ${room.hostId}, CurrentUser: ${req.user.userId}`);
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền tạo hợp đồng cho phòng này'
      });
    }

    // Kiểm tra nếu đã có hợp đồng active
    const existingContract = await Contract.findOne({ roomId, status: 'active' });
    if (existingContract) {
      //   console.log(`[ERROR] Đã tồn tại hợp đồng active cho phòng: ${roomId}`);
      return res.status(400).json({
        success: false,
        message: 'Phòng đã có hợp đồng đang hoạt động'
      });
    }

    // Tạo hợp đồng
    const contract = await Contract.create({
      contractId: `CT-${Date.now()}`,
      bookingId,
      roomId,
      tenantId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      duration,
      rentPrice,
      terms
    });
    // Cập nhật trạng thái phòng
    await Room.findOneAndUpdate({ roomId }, { status: 'Waiting' });

    // console.log('[DEBUG] Hợp đồng đã tạo:', contract);

    res.status(201).json({
      success: true,
      message: 'Tạo hợp đồng thành công',
      data: contract
    });
  } catch (error) {
    console.error('[FATAL ERROR] Khi tạo hợp đồng:', error);
    next(error);
  }
};
// Lấy tất cả hợp đồng (chỉ admin)
// Lấy tất cả hợp đồng (chỉ admin)
exports.getAllContracts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, roomId, tenantId, contractId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};

    // Lọc theo mã (không phải _id)
    if (status) query.status = status;
    if (roomId) query.roomId = roomId;
    if (tenantId) query.tenantId = tenantId;
    if (contractId) query.contractId = contractId;

    // Lấy danh sách contract
    const contracts = await Contract.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // dùng lean() để có thể chỉnh sửa object kết quả

    // Populate thủ công theo roomId, tenantId, bookingId
    for (const contract of contracts) {
      const room = await Room.findOne({ roomId: contract.roomId }).select('roomId roomTitle location');
      const tenant = await User.findOne({ userId: contract.tenantId }).select('userId fullName email phone');
      const booking = await Booking.findOne({ bookingId: contract.bookingId }).select('bookingId startDate');

      contract.roomInfo = room || null;
      contract.tenantInfo = tenant || null;
      contract.bookingInfo = booking || null;
    }

    const total = await Contract.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        contracts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalContracts: total
        }
      }
    });
  } catch (error) {
    console.error('[getAllContracts] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách hợp đồng',
      error: error.message
    });
  }
};
// Lấy chi tiết hợp đồng theo contractId
// @desc    Lấy thông tin 1 hợp đồng bằng contractId
// @route   GET /api/contracts/:contractId
// @access  Admin, Host hoặc Tenant liên quan
// exports.getSingleContract = async (req, res) => {
//   const { contractId } = req.params;
//   console.log(`[DEBUG] Đang tìm contractId: ${contractId}`);

//   try {
//     const contract = await Contract.findOne({ contractId });

//     if (!contract) {
//       console.warn(`[WARN] Không tìm thấy hợp đồng với contractId: ${contractId}`);
//       return res.status(404).json({
//         success: false,
//         message: 'Không tìm thấy hợp đồng',
//       });
//     }

//     // Lấy thêm thông tin booking, room, tenant theo custom ID
//     const [room, booking, tenant] = await Promise.all([
//       Room.findOne({ roomId: contract.roomId }).select('roomId roomTitle location price images hostId'),
//       Booking.findOne({ bookingId: contract.bookingId }).select('bookingId createdAt totalPrice'),
//       User.findOne({ userId: contract.tenantId }).select('userId fullName email phone'),
//     ]);

//     // ✅ Kiểm tra quyền
//     const isAdmin = req.user?.role === 'admin';
//     const isOwner = room?.hostId === req.user?.userId;
//     const isTenant = tenant?.userId === req.user?.userId;

//     if (!isAdmin && !isOwner && !isTenant) {
//       console.warn('[WARN] Truy cập bị từ chối do không có quyền');
//       return res.status(403).json({
//         success: false,
//         message: 'Bạn không có quyền xem hợp đồng này',
//       });
//     }

//     console.log('[INFO] Hợp đồng được tìm thấy và trả về thành công');

//     res.status(200).json({
//       success: true,
//       data: {
//         ...contract.toObject(),
//         roomInfo: room || null,
//         bookingInfo: booking || null,
//         tenantInfo: tenant || null
//       },
//     });
//   } catch (error) {
//     console.error('[ERROR] Lỗi khi lấy hợp đồng:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi server khi lấy chi tiết hợp đồng',
//       error: error.message,
//     });
//   }
// };
exports.getSingleContract = async (req, res) => {
  const { contractId } = req.params;
  console.log(`[DEBUG] Đang tìm contractId: ${contractId}`);

  try {
    const contract = await Contract.findOne({ contractId });

    if (!contract) {
      console.warn(`[WARN] Không tìm thấy hợp đồng với contractId: ${contractId}`);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hợp đồng',
      });
    }

    // Lấy thêm thông tin room, tenant theo custom ID
    const [room, tenant] = await Promise.all([
      Room.findOne({ roomId: contract.roomId }).select('roomId roomTitle location price images hostId utilities'),
      User.findOne({ userId: contract.tenantId }).select('userId fullName email phone'),
    ]);

    // ✅ Kiểm tra quyền
    const isAdmin = req.user?.role === 'admin';
    const isOwner = room?.hostId === req.user?.userId;
    const isTenant = tenant?.userId === req.user?.userId;

    if (!isAdmin && !isOwner && !isTenant) {
      console.warn('[WARN] Truy cập bị từ chối do không có quyền');
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem hợp đồng này',
      });
    }

    console.log('[INFO] Hợp đồng được tìm thấy và trả về thành công');

    res.status(200).json({
      success: true,
      data: {
        ...contract.toObject(),
        roomInfo: room || null,
        tenantInfo: tenant || null
      },
    });
  } catch (error) {
    console.error('[ERROR] Lỗi khi lấy hợp đồng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiết hợp đồng',
      error: error.message,
    });
  }
};

exports.cancelContract = async (req, res, next) => {
  try {
    const { contractId } = req.params;

    const updated = await Contract.findOneAndUpdate(
      { contractId },
      { status: 'cancel', updatedAt: Date.now() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng' });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.terminatedContract = async (req, res, next) => {
  try {
    const { contractId } = req.params;

    const updated = await Contract.findOneAndUpdate(
      { contractId },
      { status: 'terminated', updatedAt: Date.now() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng' });
    }

    await Room.findOneAndUpdate(
      { roomId: updated.roomId },
      { status: 'available', updatedAt: Date.now() },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Hợp đồng đã được chấm dứt, phòng đã mở lại cho thuê'
    });
  } catch (err) {
    next(err);
  }
};


exports.deleteContract = async (req, res, next) => {
  try {
    const { contractId } = req.params;

    // Tìm contract trước
    const contract = await Contract.findOne({ contractId });
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng' });
    }

    // Kiểm tra điều kiện
    if (contract.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Không thể xoá hợp đồng đang active'
      });
    }

    await Contract.deleteOne({ contractId });

    return res.status(200).json({
      success: true,
      message: 'Đã xoá hợp đồng thành công',
      data: contract
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserByRoomId = async (req, res) => {

  try {
    const { roomId } = req.params;

    // 1) Tìm contract theo roomId (và status=active nếu cần)
    const contract = await Contract.findOne({ roomId, status: 'active' })
      .select('tenantId')
      .lean();

    if (!contract) {
      return res.status(200).json({
        success: false,
        message: 'Không tìm thấy hợp đồng active với roomId này',
      }); // ⬅ nhớ return
    }

    if (!contract.tenantId) {
      return res.status(200).json({
        success: false,
        message: 'Hợp đồng không có tenantId',
      });
    }

    // 2) Lấy user theo userId (tenantId đang là chuỗi userId)
    const user = await User.findOne({
      userId: contract.tenantId,           // nếu cần filter user active: status: 'active'
      // status: 'active',
    })
      .select('userId fullName email phone role status avatar address')
      .lean();

    if (!user) {
      return res.status(200).json({
        success: false,
        message: 'Không tìm thấy user tương ứng',
      });
    }

    // 3) Trả kết quả
    return res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error('[getActiveContractUserByRoomId] error:', err);
    // đảm bảo chỉ gửi response 1 lần
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};