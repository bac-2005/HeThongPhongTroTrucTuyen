// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewId: {
    type: String,
    unique: true,
    required: true,
    default: () => 'rev' + Date.now().toString().slice(-5), // ví dụ: rev12345
    immutable: true  
  },
  roomId: {
    type: String,
    required: true,
    ref: 'Room' // Tham chiếu theo roomId
  },
  tenantId: {
    type: String,
    required: true,
    ref: 'User' // Tham chiếu theo userId
  },
  review: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  reviewDate: {
    type: Date,
    default: Date.now
  },
  isRecommended: {
    type: Boolean,
    default: false
  },
  images: {
    type: [String],
    default: []
  },
  isApproved: {
    type: Boolean,
    default: false
  }
});

// Middleware sinh reviewId
reviewSchema.pre('save', async function (next) {
  if (!this.reviewId) {
    const last = await mongoose.model('Review').findOne().sort({ reviewId: -1 });
    let nextNum = 1;
    if (last && last.reviewId) {
      const lastNum = parseInt(last.reviewId.replace('rev', ''), 10);
      if (!isNaN(lastNum)) {
        nextNum = lastNum + 1;
      }
    }
    this.reviewId = 'rev' + String(nextNum).padStart(3, '0');
  }
  next();
});

module.exports = mongoose.model('Review', reviewSchema);
