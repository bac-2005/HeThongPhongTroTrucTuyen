// routes/statisticRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAdminStats,
  getHostStats
} = require('../controllers/statisticsController');

// // Lấy thống kê cho admin
// router.get('/dashboard', protect, authorize('admin'), getAdminStats);

router.get('/admin', protect, authorize('admin'), getAdminStats);

// Host xem theo hostId của chính mình (lấy từ token)
router.get('/host', protect, authorize('host', 'admin'), getHostStats);

module.exports = router;