const express = require('express');
const {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
  sendBulkNotifications
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Tạo một thông báo mới (chỉ admin và host)
router.post('/', protect, authorize('admin','host'), createNotification);

// Gửi thông báo hàng loạt tới nhiều người dùng (host và admin)
router.post('/bulk', protect, authorize('admin','host'), sendBulkNotifications);

// Lấy tất cả thông báo của người dùng hiện tại
router.get('/', protect, getUserNotifications);

// Lấy thống kê số lượng thông báo (đã đọc, chưa đọc)
router.get('/stats', protect, getNotificationStats);

// Đánh dấu một thông báo là đã đọc theo ID
router.put('/:id/read', protect, markNotificationAsRead);

// Đánh dấu tất cả thông báo là đã đọc
router.put('/read-all', protect, markAllAsRead);

// Xóa một thông báo theo ID
router.delete('/:id', protect, deleteNotification);

module.exports = router;
