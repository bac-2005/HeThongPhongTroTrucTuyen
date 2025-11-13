const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true // không cần required
  },
  senderId: {
    type: String, // userId
    required: true,
    ref: 'User'
  },
  receiverId: {
    type: String, // userId
    required: true,
    ref: 'User'
  },
  amount: { type: Number, required: true },
  content: { type: String, trim: true },
  method: { type: String, trim: true }, // momo, bank, cash...
  time: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Auto tăng transactionId: tran001, tran002...
transactionSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    const allTrans = await mongoose.model('Transaction')
      .find()
      .select('transactionId');

    let max = 0;
    allTrans.forEach(t => {
      if (t.transactionId) {
        const num = parseInt(t.transactionId.replace(/^tran/i, ''), 10);
        if (!isNaN(num) && num > max) max = num;
      }
    });

    this.transactionId = 'tran' + String(max + 1).padStart(3, '0');
  }
  next();
});
module.exports = mongoose.model('Transaction', transactionSchema, 'transactions');
