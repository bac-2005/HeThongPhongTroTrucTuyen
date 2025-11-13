const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  assignRole,
  getRoles,
  updateRole,
  getUserRole,
  revokeRole,
  getRoleStats
} = require('../controllers/roleController');

const router = express.Router();

// Gán vai trò
router.post('/', protect, authorize('admin'), assignRole);

// Lấy tất cả vai trò
router.get('/', protect, authorize('admin'), getRoles);

// Cập nhật vai trò
router.put('/:id', protect, authorize('admin'), updateRole);

// Lấy vai trò theo người dùng
router.get('/user/:userId', protect, authorize('admin'), getUserRole);

// Hủy vai trò
router.delete('/:id', protect, authorize('admin'), revokeRole);

// Thống kê vai trò
router.get('/statistics', protect, authorize('admin'), getRoleStats);

module.exports = router;
