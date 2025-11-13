const express = require('express');
const router = express.Router();
const {
  createReview,
  getRoomReviews,
  getAllReviews,
  updateReview,
  deleteReview,
  approveReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

// Tạo đánh giá mới
router.post('/', protect, authorize('tenant'), createReview);

// Lấy đánh giá của 1 phòng
router.get('/:roomId', getRoomReviews);

// Lấy tất cả đánh giá (host và admin)
router.get('/', protect, authorize('admin','host'), getAllReviews);

// Cập nhật đánh giá
router.put('/:id', protect, authorize('tenant'), updateReview);

// Xoá đánh giá
router.delete('/:id', protect, deleteReview);

// Duyệt hoặc huỷ duyệt đánh giá (admin)
router.put('/:id/approve', protect, authorize('host','admin'), approveReview);

module.exports = router;
