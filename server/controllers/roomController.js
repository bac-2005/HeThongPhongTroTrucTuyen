const Room = require('../models/Room');
const User = require('../models/User');
// const RoomApproval = require('../models/RoomApproval');
const asyncHandler = require('express-async-handler');
// --- ở đầu file (nếu muốn) ---
const ALLOWED_ROOM_STATUS = ['available', 'rented', 'maintenance'];

// --- thêm mới controller ---
const updateRoomStatus = async (req, res) => {
  try {
    const { id } = req.params;       
    const { status } = req.body;      

    // Validate input
    if (!status || !ALLOWED_ROOM_STATUS.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Trạng thái không hợp lệ. Chỉ chấp nhận: ${ALLOWED_ROOM_STATUS.join(', ')}`
      });
    }

    // Tìm phòng theo roomId
    const room = await Room.findOne({ roomId: id });
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    if (room.status === 'rented') {
      return res.status(400).json({
        success: false,
        message: 'Phòng đang ở trạng thái "Đã cho thuê" nên không thể cập nhật'
      });
    }

    // Kiểm quyền: host (đúng chủ phòng) hoặc admin
    const currentUserId = req.user.userId || req.user._id?.toString();
    const isOwner = room.hostId === currentUserId;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this room status' });
    }

    // Cập nhật
    room.status = status;
    room.updatedAt = new Date();
    await room.save();

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái phòng thành công',
      data: {
        roomId: room.roomId,
        status: room.status,
        updatedAt: room.updatedAt
      }
    });
  } catch (err) {
    console.error('[updateRoomStatus] error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public

const escapeRegex2 = (s) =>
  String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const searchRooms = async (req, res) => {
  try {
    const { keyword } = req.query;
    const role = req.user?.role || 'guest';

    if (!keyword || !keyword.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng truyền keyword để tìm kiếm',
      });
    }

    const regex = new RegExp(escapeRegex2(keyword.trim()), 'i');

    // Match theo keyword (title/location)
    const baseMatch = {
      $or: [{ roomTitle: { $regex: regex } }, { location: { $regex: regex } }],
    };

    const pipeline = [
      { $match: baseMatch },
      {
        $lookup: {
          from: 'users',
          localField: 'hostId',
          foreignField: 'userId',
          as: 'host',
        },
      },
      { $addFields: { host: { $arrayElemAt: ['$host', 0] } } },
    ];

    // Chỉ khi KHÔNG phải admin/host mới ép available + approved
    if (!['admin', 'host'].includes(role)) {
      pipeline.push(
        { $match: { status: 'available' } },
        {
          $lookup: {
            from: 'room_approvals',
            let: { rid: '$roomId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$roomId', '$$rid'] } } },
              { $sort: { requestedAt: -1, createdAt: -1, _id: -1 } },
              { $limit: 1 },
            ],
            as: 'approval',
          },
        },
        { $addFields: { lastApproval: { $arrayElemAt: ['$approval', 0] } } },
        { $match: { 'lastApproval.status': 'approved' } },
      );
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          roomId: 1,
          roomTitle: 1,
          price: 1,
          area: 1,
          location: 1,
          images: 1,
          roomType: 1,
          status: 1,
          utilities: 1,
          terms: 1,
          hostId: 1,
          createdAt: 1,
        },
      }
    );

    const rooms = await Room.aggregate(pipeline);

    return res.json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (err) {
    console.error('[searchRooms] error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const escapeRegex = (s = '') => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const searchRoomsRegex = async (req, res) => {
  try {
    let {
      roomType, province, location, status, utilities,
      minPrice, maxPrice, minArea, maxArea,
      sortBy = 'newest', page = 1, limit = 20,
    } = req.query;

    // ép kiểu số an toàn
    page = Math.max(parseInt(page) || 1, 1);
    limit = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const role = req.user?.role || 'guest';

    // ==== build filter cơ bản từ query ====
    const filter = {};
    const and = [];

    if (roomType) filter.roomType = roomType;

    // giá
    const priceCond = {};
    if (minPrice !== undefined && minPrice !== '') priceCond.$gte = Number(minPrice);
    if (maxPrice !== undefined && maxPrice !== '') priceCond.$lte = Number(maxPrice);
    if (Object.keys(priceCond).length) filter['price.value'] = priceCond;

    // diện tích
    const areaCond = {};
    if (minArea !== undefined && minArea !== '') areaCond.$gte = Number(minArea);
    if (maxArea !== undefined && maxArea !== '') areaCond.$lte = Number(maxArea);
    if (Object.keys(areaCond).length) filter.area = areaCond;

    // tiện ích: yêu cầu chứa tất cả tiện ích truyền vào
    if (utilities) {
      const arr = String(utilities).split(',').map(s => s.trim()).filter(Boolean);
      if (arr.length) filter.utilities = { $all: arr };
    }

    // LIKE theo location/province
    if (location) and.push({ location: { $regex: new RegExp(escapeRegex(location), 'i') } });
    if (province) and.push({ location: { $regex: new RegExp(escapeRegex(province), 'i') } });

    // Cho phép user tự truyền status, nhưng *sẽ bị bỏ qua* nếu role không phải admin/host (vì ta sẽ ép available ở dưới)
    if (status) filter.status = status;

    const finalFilter = Object.keys(filter).length || and.length
      ? (and.length ? { $and: [filter, ...and] } : filter)
      : {};

    // ==== sort ====
    let sort = { createdAt: -1 };
    switch (sortBy) {
      case 'price_asc':  sort = { 'price.value': 1,  createdAt: -1 }; break;
      case 'price_desc': sort = { 'price.value': -1, createdAt: -1 }; break;
      case 'area_asc':   sort = { area: 1, createdAt: -1 }; break;
      case 'area_desc':  sort = { area: -1, createdAt: -1 }; break;
      case 'oldest':     sort = { createdAt: 1 }; break;
      case 'newest':
      default:           sort = { createdAt: -1 };
    }

    // ==== pipeline ====
    const pipeline = [
      { $match: finalFilter },
      {
        $lookup: {
          from: 'users',
          localField: 'hostId',
          foreignField: 'userId',
          as: 'host',
        },
      },
      { $addFields: { host: { $arrayElemAt: ['$host', 0] } } },
    ];

    // Nếu KHÔNG phải admin/host ⇒ bắt buộc available + approved
    if (!['admin', 'host'].includes(role)) {
      // ép available, thay vì tin vào filter.status phía trên
      pipeline.push({ $match: { status: 'available' } });

      pipeline.push(
        {
          $lookup: {
            from: 'room_approvals',
            let: { rid: '$roomId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$roomId', '$$rid'] } } },
              { $sort: { requestedAt: -1, createdAt: -1, _id: -1 } },
              { $limit: 1 },
            ],
            as: 'approval',
          },
        },
        { $addFields: { lastApproval: { $arrayElemAt: ['$approval', 0] } } },
        { $match: { 'lastApproval.status': 'approved' } },
      );
    }
    // Nếu là admin/host ⇒ bỏ qua 2 điều kiện trên (xem được tất cả theo filter cơ bản)

    pipeline.push(
      { $sort: sort },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                roomId: 1,
                roomTitle: 1,
                price: 1,
                area: 1,
                location: 1,
                description: 1,
                images: 1,
                roomType: 1,
                status: 1,
                utilities: 1,
                terms: 1,
                createdAt: 1,
                host: { _id: 1, userId: 1, fullName: 1, email: 1, phone: 1, role: 1 },
                lastApproval: 1,
              },
            },
          ],
          total: [{ $count: 'count' }],
        },
      }
    );

    const result = await Room.aggregate(pipeline);
    const data = result?.[0]?.data ?? [];
    const total = result?.[0]?.total?.[0]?.count ?? 0;

    res.status(200).json({
      success: true,
      count: data.length,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data,
    });
  } catch (err) {
    console.error('[searchRoomsRegex] error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// controllers/roomController.js
const getRooms = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      roomType,
      location,
      minPrice,
      maxPrice,
      status,
      utilities,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const userRole = req.user?.role || 'guest';
    console.log(req.user);
    const match = {};
    if (roomType) match.roomType = roomType;
    if (location) match.location = { $regex: String(location), $options: 'i' };
    if (status) match.status = status;
    else if (userRole !== 'admin') match.status = 'available';

    if (minPrice || maxPrice) {
      match['price.value'] = {};
      if (minPrice) match['price.value'].$gte = Number(minPrice);
      if (maxPrice) match['price.value'].$lte = Number(maxPrice);
    }

    if (utilities) {
      const arr = String(utilities).split(',').map(s => s.trim()).filter(Boolean);
      if (arr.length) match.utilities = { $in: arr };
    }

    const allowedSort = new Set(['createdAt', 'updatedAt', 'price.value', 'area']);
    const sortKey = allowedSort.has(sortBy) ? sortBy : 'createdAt';
    const sortDir = String(sortOrder).toLowerCase() === 'asc' ? 1 : -1;
    const sortStage = { [sortKey]: sortDir };

    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * pageSize;

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'users',
          localField: 'hostId',
          foreignField: 'userId',
          as: 'host',
        },
      },
      { $addFields: { host: { $arrayElemAt: ['$host', 0] } } },
    ];

    if (userRole !== 'admin') {
      pipeline.push(
        {
          $lookup: {
            from: 'room_approvals',
            let: { rid: '$roomId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$roomId', '$$rid'] } } },
              { $sort: { requestedAt: -1, createdAt: -1, _id: -1 } },
              { $limit: 1 },
            ],
            as: 'approval',
          },
        },
        { $addFields: { lastApproval: { $arrayElemAt: ['$approval', 0] } } },
        { $match: { 'lastApproval.status': 'approved' } }
      );
    }

    pipeline.push(
      { $sort: sortStage },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: pageSize },
            {
              $project: {
                _id: 1,
                roomId: 1,
                roomTitle: 1,
                price: 1,
                area: 1,
                location: 1,
                description: 1,
                images: 1,
                roomType: 1,
                status: 1,
                utilities: 1,
                terms: 1,
                createdAt: 1,
                updatedAt: 1,
                host: { _id: 1, userId: 1, fullName: 1, email: 1, phone: 1 },
                lastApproval: 1,
              },
            },
          ],
          total: [{ $count: 'count' }],
        },
      }
    );

    const result = await Room.aggregate(pipeline);
    const data = result?.[0]?.data ?? [];
    const total = result?.[0]?.total?.[0]?.count ?? 0;

    res.status(200).json({
      success: true,
      data: {
        rooms: data,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / pageSize),
          totalRooms: total,
          hasNextPage: skip + data.length < total,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public

const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findOne({ roomId: req.params.id }).populate({
      path: 'hostId',
      select: 'fullName email phone avatar address'
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...room.toObject(),
        hostInfo: room.hostId  // đã được populate thành thông tin User
      }
    });

  } catch (error) {
    console.error('❌ Error in getRoom:', error);
    next(error);
  }
};


// @desc    Create new room
// @route   POST /api/rooms
// @access  Private (Host only)

const createRoom = async (req, res) => {
  try {
    const roomData = {
      ...req.body,
      hostId: req.user.userId // Gán userId (string) từ người đang login
    };

    const newRoom = await Room.create(roomData);

    res.status(201).json({
      success: true,
      data: newRoom
    });
  } catch (err) {
    console.error('Lỗi tạo phòng:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (Host only - own rooms)

const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findOne({ roomId: id });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // 🔁 So sánh userId (chuỗi) thay vì _id
    const currentUserId = req.user.userId || req.user._id.toString();

    if (
      room.hostId !== currentUserId &&  // dùng hostId là string
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this room'
      });
    }

    // Không cho phép sửa hostId
    delete req.body.hostId;

    const updatedRoom = await Room.findOneAndUpdate(
      { roomId: id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedRoom
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Host only - own rooms)

const deleteRoom = asyncHandler(async (req, res) => {
  const { id } = req.params; // roomId

  const room = await Room.findOne({ roomId: id });
  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Room not found'
    });
  }

  // Kiểm tra quyền xoá
  if (
    room.hostId !== req.user.userId &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this room'
    });
  }

  // soft delete thay vì xoá hẳn
  room.status = 'deleted';
  room.updatedAt = new Date();
  await room.save();

  res.status(200).json({
    success: true,
    message: 'Đã chuyển trạng thái phòng sang deleted',
    data: { roomId: room.roomId, status: room.status }
  });
});


// @desc    Get rooms by host
// @route   GET /api/rooms/host/:hostId
// @access  Public
const getRoomsByHost = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const rooms = await Room.find({ hostId: req.params.hostId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Room.countDocuments({ hostId: req.params.hostId });

    res.status(200).json({
      success: true,
      data: {
        rooms,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalRooms: total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my rooms (for authenticated host)
// @route   GET /api/rooms/my-rooms
// @access  Private (Host only)
const getMyRooms = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { hostId: req.user.userId };
    if (status) query.status = status;

    const rooms = await Room.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Room.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        rooms,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalRooms: total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomsByHost,
  getMyRooms,
  searchRoomsRegex,
  updateRoomStatus,
  searchRooms
};