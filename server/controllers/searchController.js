const SearchLog = require('../models/SearchLog');
const Room = require('../models/Room');

// [GET] Tìm kiếm phòng
exports.searchRooms = async (req, res) => {
  try {
    const { roomType, location, minPrice, maxPrice, area, keyword } = req.query;

    let query = { status: 'available' };

    if (roomType) query.roomType = roomType;
    if (location) query.location = location;
    if (area) query.area = { $gte: area };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (keyword) query.keyword = { $regex: keyword, $options: 'i' };

    const rooms = await Room.find(query);
    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    console.error('searchRooms error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// [GET] Gợi ý từ khoá
exports.getSuggestions = async (req, res) => {
  try {
    const suggestions = await Room.distinct('keyword');
    res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    console.error('getSuggestions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// [GET] Lịch sử tìm kiếm của user
exports.getSearchHistory = async (req, res) => {
  try {
    const logs = await SearchLog.find({ userId: req.user.userId }).sort({ searchTime: -1 });
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    console.error('getSearchHistory error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// [DELETE] Xoá lịch sử tìm kiếm
exports.clearSearchHistory = async (req, res) => {
  try {
    await SearchLog.deleteMany({ userId: req.user.userId });
    res.status(200).json({ success: true, message: 'Deleted all search history' });
  } catch (error) {
    console.error('clearSearchHistory error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
