const express = require('express');
const {
  searchRooms,
  getSuggestions,
  getSearchHistory,
  clearSearchHistory
} = require('../controllers/searchController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// [GET] Tìm kiếm phòng
router.get('/rooms', searchRooms);

// [GET] Gợi ý từ khoá
router.get('/suggestions', getSuggestions);

// [GET] Lịch sử tìm kiếm
router.get('/history', protect, getSearchHistory);

// [DELETE] Xoá lịch sử
router.delete('/history', protect, clearSearchHistory);

module.exports = router;
