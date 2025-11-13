const express = require('express');
const {
  sendMessage,
  getConversationMessages,
  getUserConversations
} = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Gửi tin nhắn
router.post('/', protect, authorize('tenant', 'host'), sendMessage);

// Lấy tin nhắn của 1 cuộc trò chuyện
router.get('/conversation/:tenantId/:hostId', protect, authorize('tenant', 'host'), getConversationMessages);

// Lấy tất cả cuộc trò chuyện của người dùng
router.get('/conversations', protect, authorize('tenant', 'host'), getUserConversations);

module.exports = router;
