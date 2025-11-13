const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema({
  logId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String, // tham chiếu userId từ bảng User
    required: true,
    ref: 'User'
  },
  roomType: { type: String, trim: true },
  location: { type: String, trim: true },
  price: { type: Number },
  area: { type: Number },
  utilities: [String],
  status: { type: String, enum: ['available', 'occupied'], default: 'available' },
  keyword: { type: String, trim: true },
  searchTime: { type: Date, default: Date.now }
});

// Auto tăng logId: log001, log002...
searchLogSchema.pre('save', async function (next) {
  if (!this.logId) {
    const allLogs = await mongoose.model('SearchLog').find({}).select('logId');
    let max = 0;
    allLogs.forEach(l => {
      if (l.logId) {
        const num = parseInt(l.logId.replace(/^log/i, ''), 10);
        if (!isNaN(num) && num > max) max = num;
      }
    });
    const nextNumber = max + 1;
    this.logId = 'log' + String(nextNumber).padStart(3, '0');
  }
  next();
});

module.exports = mongoose.model('SearchLog', searchLogSchema, 'search_logs');
