const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  contractId: { 
    type: String, 
    required: true,
    unique: true,
    immutable: true  
   },
  bookingId: {
    type: String,
    required: true,
    ref: 'Booking'
  },
  roomId: {
    type: String,
    required: true,
    ref: 'Room'
  },
  tenantId: {
    type: String,
    required: true,
    ref: 'User'
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  duration: Number, // đơn vị: tháng
  rentPrice: Number,
  terms: String,
  note: String, // ghi chú thêm nếu có
  status: {
    type: String,
    enum: ['active','expired', 'terminated', 'pending'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contract', contractSchema);
