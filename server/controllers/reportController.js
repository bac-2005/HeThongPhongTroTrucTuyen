const Report = require('../models/Report');
const User = require('../models/User');
const Room = require('../models/Room');

exports.getReportsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Kiểm tra phòng có tồn tại không (tùy chọn)
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Phòng không tồn tại' });
    }

    // Lấy danh sách báo cáo của phòng này
    const reports = await Report.find({ roomId });
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    console.error('Lỗi khi lấy báo cáo theo roomId:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
// [POST] Tạo báo cáo mới
exports.createReport = async (req, res) => {
  try {
    const { roomId, title, description } = req.body;

    // Lấy userId từ bảng Users (không dùng _id của token)
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    // Kiểm tra roomId có tồn tại không
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Phòng không tồn tại' });
    }

    // Tạo reportId ngẫu nhiên
    const reportId = 'report_' + Date.now();

    const newReport = await Report.create({
      reportId,
      reporterId: user.userId, // userId từ bảng Users
      roomId: room.roomId, // roomId từ bảng Rooms
      title,
      description
    });

    res.status(201).json({
      success: true,
      data: newReport
    });
  } catch (error) {
    console.error('Lỗi khi tạo báo cáo:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// [GET] Lấy tất cả báo cáo (Admin)
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find();
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
// [GET] Lấy báo cáo theo reportId (Admin)
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({ reportId: req.params.id }); // tìm theo reportId
    if (!report) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo' });
    }
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo:", error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// [PUT] Cập nhật trạng thái báo cáo theo reportId (Admin)
exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findOneAndUpdate(
      { reportId: req.params.id }, // tìm theo reportId
      { status },
      { new: true }
    );
    if (!report) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo' });
    }
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái báo cáo:", error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// [GET] Lấy danh sách báo cáo của user hiện tại
exports.getMyReports = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    const reports = await Report.find({ reporterId: user.userId });
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách báo cáo của user:", error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// [DELETE] Xóa báo cáo theo reportId (Admin)
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({ reportId: req.params.id });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo' });
    }
    res.status(200).json({ success: true, message: 'Xóa báo cáo thành công' });
  } catch (error) {
    console.error("Lỗi khi xóa báo cáo:", error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
