const mongoose = require('mongoose');
const { generateMessageId } = require('../utils/generateId'); // Hàm này sinh messageId như "msg001"

const messageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    unique: true,
    default: generateMessageId,
    immutable: true  
  },
  tenantId: {
    type: String, // VD: "user004"
    required: true
  },
  hostId: {
    type: String, // VD: "user002"
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  time: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
});

module.exports = mongoose.model('Message', messageSchema);
