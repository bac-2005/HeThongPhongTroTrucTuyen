const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
    immutable: true  
  },
  roomId: {
    type: String, // Tham chiếu tới roomId (không phải _id)
    required: true,
  },
  tenantId: {
    type: String, // Tham chiếu tới userId (không phải _id)
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  note: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  },
   bookingStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Booking', bookingSchema);
