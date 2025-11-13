const mongoose = require('mongoose');

const statisticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  totalUsers: { type: Number, default: 0 },
  totalRooms: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  totalContracts: { type: Number, default: 0 },
  newUsers: { type: Number, default: 0 },
  activeUsers: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Collection: statistics
module.exports = mongoose.model('Statistics', statisticsSchema, 'statistics');
