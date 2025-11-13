const Message = require('../models/Message');

// Hàm tạo messageId tự động (msg001, msg002, ...)
const generateMessageId = async () => {
  const count = await Message.countDocuments();
  return `msg${(count + 1).toString().padStart(3, '0')}`;
};

// @desc    Gửi tin nhắn mới
// @route   POST /api/messages
// @access  Private (tenant, host)
exports.sendMessage = async (req, res) => {
  try {
    const { hostId, message } = req.body;
    const tenantId = req.user.userId;

    console.log('[LOG] Gửi tin nhắn:', { tenantId, hostId, message });

    if (!hostId || !message) {
      return res.status(400).json({ success: false, message: 'Thiếu hostId hoặc message' });
    }

    const messageId = await generateMessageId();

    const newMessage = await Message.create({
      messageId,
      tenantId,
      hostId,
      message,
      time: new Date()
    });

    return res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error('[ERROR] Lỗi gửi tin nhắn:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// @desc    Lấy tất cả tin nhắn giữa tenant và host
// @route   GET /api/messages/conversation/:tenantId/:hostId
// @access  Private (tenant, host)
exports.getConversationMessages = async (req, res) => {
  const { tenantId, hostId } = req.params;

  try {
    const messages = await Message.find({
      tenantId,
      hostId
    }).sort({ time: 1 });

    console.log(`[LOG] Lấy tin nhắn giữa ${tenantId} và ${hostId}: ${messages.length} tin`);

    return res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    console.error('[ERROR] Lỗi lấy tin nhắn:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// @desc    Lấy tất cả cuộc trò chuyện của người dùng hiện tại
// @route   GET /api/messages/conversations
// @access  Private (tenant, host)
exports.getUserConversations = async (req, res) => {
  const currentUser = req.user.userId;

  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ tenantId: currentUser }, { hostId: currentUser }]
        }
      },
      {
        $group: {
          _id: {
            tenantId: '$tenantId',
            hostId: '$hostId'
          },
          latestMessage: { $last: '$$ROOT' }
        }
      },
      {
        $sort: { 'latestMessage.time': -1 }
      }
    ]);

    console.log(`[LOG] Cuộc trò chuyện của ${currentUser}:`, conversations.length);

    return res.status(200).json({ success: true, count: conversations.length, data: conversations });
  } catch (error) {
    console.error('[ERROR] Lỗi lấy cuộc trò chuyện:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
