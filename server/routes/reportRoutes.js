const express = require('express');
const {
  createReport,
  getAllReports,
  getReportById,
  updateReportStatus,
  getMyReports,
  deleteReport,
  getReportsByRoom
} = require('../controllers/reportController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Tạo report mới
router.post('/', protect, createReport);

// Lấy danh sách report của người dùng hiện tại
router.get('/my-reports', protect, getMyReports);

// Lấy danh sách report (host và admin)
router.get('/', protect, authorize('admin','host'), getAllReports);

// Lấy báo cáo cụ thể theo ID (admin)
router.get('/:id', protect,  getReportById);

// Cập nhật trạng thái report (admin)
router.put('/:id', protect, authorize('admin','host'), updateReportStatus);
// Xóa báo cáo (admin)
router.delete('/:id', protect, authorize('admin'), deleteReport);

// Lấy báo cáo theo roomId
router.get('/room/:roomId', protect, getReportsByRoom);

module.exports = router;
