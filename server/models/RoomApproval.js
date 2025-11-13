const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema({
  approvalId: {
    type: String,
    unique: true
  },
  note: { type: String },
  roomId: {
    type: String, // roomId tự định nghĩa trong Rooms
    required: true,
    ref: 'Room'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Auto tăng approvalId APP001, APP002...
approvalSchema.pre('save', async function (next) {
  if (!this.approvalId) {
    const lastApproval = await mongoose.model('Approval').findOne().sort({ approvalId: -1 });
    let nextNumber = 1;
    if (lastApproval && lastApproval.approvalId) {
      const lastNumber = parseInt(lastApproval.approvalId.replace('APP', ''), 10);
      nextNumber = lastNumber + 1;
    }
    this.approvalId = `APP${String(nextNumber).padStart(3, '0')}`;
  }
  next();
});

// module.exports = mongoose.model('Approval', approvalSchema);
module.exports = mongoose.model('Approval', approvalSchema, 'room_approvals');
