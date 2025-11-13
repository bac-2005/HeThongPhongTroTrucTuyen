// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    required: true,
    unique: true,
    immutable: true  
  },
  receiverId: { // userId hoặc bất kỳ định danh string nào
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['booking', 'contract', 'payment', 'system'],
    default: 'system'
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread'
  },
  data: { // dữ liệu bổ sung như bookingId, contractId...
    type: Object,
    default: {}
  },
  readAt: Date
}, { timestamps: true });

notificationSchema.index({ receiverId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
