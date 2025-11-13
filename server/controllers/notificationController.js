// controllers/notificationController.js
const Notification = require('../models/Notification');
const {generateNotificationId} = require('../utils/generateId');
// Tạo một thông báo mới
exports.createNotification = async (req, res) => {
  try {
    const { receiverId, title, message, type, data } = req.body;

    const notification = await Notification.create({
      notificationId: generateNotificationId(),
      receiverId,
      title,
      message,
      type,
      data
    });

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Gửi hàng loạt thông báo
exports.sendBulkNotifications = async (req, res) => {
  try {
    const { receiverIds, title, message, type, data } = req.body;

    if (!receiverIds || receiverIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Không có danh sách người nhận' });
    }

    const notifications = receiverIds.map(id => ({
      notificationId: generateNotificationId(),
      receiverId: id,
      title,
      message,
      type,
      data
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({ success: true, count: notifications.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy thông báo của user
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ receiverId: req.user.userId })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Đánh dấu tất cả là đã đọc
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { receiverId: req.user.userId, status: 'unread' },
      { status: 'read', readAt: new Date() }
    );

    res.status(200).json({ success: true, message: 'Đã đánh dấu tất cả là đã đọc' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// đánh dấu 1 tb đã đọc
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { notificationId: req.params.id, receiverId: req.user.userId },
      { status: 'read' },
      { new: true }
    );

    if (!notif) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });
    }

    res.json({ success: true, data: notif });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa thông báo
exports.deleteNotification = async (req, res) => {
  try {
    const notif = await Notification.findOneAndDelete({
      notificationId: req.params.id,
      receiverId: req.user.userId
    });

    if (!notif) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });
    }

    res.json({ success: true, message: 'Xóa thông báo thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy thống kê thông báo
exports.getNotificationStats = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      receiverId: req.user.userId,
      status: 'unread'
    });

    const readCount = await Notification.countDocuments({
      receiverId: req.user.userId,
      status: 'read'
    });

    res.status(200).json({
      success: true,
      data: { unread: unreadCount, read: readCount }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
