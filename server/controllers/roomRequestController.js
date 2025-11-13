const RoomRequest = require('../models/RoomRequest');
const Room = require('../models/Room');

// Tạo yêu cầu thuê phòng
exports.createRoomRequest = async (req, res) => {
  try {
    const { roomId, note } = req.body;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const newRequest = await RoomRequest.create({
      roomId,
      requestedBy: req.user.userId, // lấy userId từ token
      note
    });

    res.status(201).json({ success: true, data: newRequest });
  } catch (error) {
    console.error('Create RoomRequest error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Lấy danh sách yêu cầu
exports.getRoomRequests = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'tenant') {
      query.requestedBy = req.user.userId;
    }

    let requests = await RoomRequest.find(query)
      .populate({
        path: 'requestedBy',
        model: 'User',
        localField: 'requestedBy',
        foreignField: 'userId',
        select: 'name email'
      })
      .populate({
        path: 'roomId',
        model: 'Room',
        localField: 'roomId',
        foreignField: 'roomId',
        select: 'roomId name price hostId'
      });

    if (req.user.role === 'host') {
      requests = requests.filter(r => r.roomData && r.roomData.hostId === req.user.userId);
    }

    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    console.error('Get RoomRequests error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Cập nhật trạng thái yêu cầu
exports.updateRoomRequest = async (req, res) => {
  try {
    const { requestStatus, note } = req.body;

    // Tìm theo requestId string
    const request = await RoomRequest.findOne({ requestId: req.params.id });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (requestStatus) request.requestStatus = requestStatus;
    if (note) request.note = note;

    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error('Update RoomRequest error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

