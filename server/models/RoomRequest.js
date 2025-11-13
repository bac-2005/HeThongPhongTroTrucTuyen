const mongoose = require('mongoose');

const roomRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    unique: true
  },
  roomId: {
    type: String, // tham chiếu tới field roomId của Room
    required: true,
    ref: 'Room'
  },
  requestedBy: {
    type: String, // userId lấy từ token
    required: true,
    ref: 'User'
  },
  note: { type: String, trim: true },
  requestDate: { type: Date, default: Date.now },
  requestStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
});

// Auto tăng requestId: REQ001, REQ002...
// roomRequestSchema.pre('save', async function (next) {
//   if (!this.requestId) {
//     const lastRequest = await mongoose.model('RoomRequest').findOne().sort({ requestId: -1 });
//     let nextNumber = 1;
//     if (lastRequest && lastRequest.requestId) {
//       const lastNumber = parseInt(lastRequest.requestId.replace('REQ', ''), 10);
//       nextNumber = lastNumber + 1;
//     }
//     this.requestId = `REQ${String(nextNumber).padStart(3, '0')}`;
//   }
//   next();
// });
// Auto tăng requestId: req001, req002 ...
roomRequestSchema.pre('save', async function (next) {
  if (!this.requestId) {
    const allRequests = await mongoose.model('RoomRequest').find({}).select('requestId');
    
    // Lấy số lớn nhất hiện có
    let max = 0;
    allRequests.forEach(r => {
      if (r.requestId) {
        const num = parseInt(r.requestId.replace(/^req/i, ''), 10);
        if (!isNaN(num) && num > max) max = num;
      }
    });

    const nextNumber = max + 1;
    this.requestId = 'req' + String(nextNumber).padStart(3, '0'); // req007
  }
  next();
});

module.exports = mongoose.model('RoomRequest', roomRequestSchema, 'room_requests');
