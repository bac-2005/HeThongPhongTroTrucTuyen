const mongoose = require('mongoose');
const { generateRoomId } = require('../utils/generateId');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    unique: true,
    default: generateRoomId,
    immutable: true 
  },
  roomTitle: {
    type: String,
    required: [true, 'Please add a room title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  price: {
  value: Number,
  unit: String
  },
  area: {
    type: Number,
    required: [true, 'Please add area'],
    min: [1, 'Area must be at least 1 square meter']
  },
  location: {
    type: String,
    required: [true, 'Please add location'],
    trim: true,
    maxlength: [300, 'Location cannot be more than 300 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
      },
      message: 'Please provide valid image URLs'
    }
  }],
  roomType: {
    type: String,
    enum: ['single', 'shared', 'apartment'],
    required: [true, 'Please specify room type']
  },
  status: {
    type: String,
    enum: ['available', 'rented', 'maintenance', 'Waiting', 'deleted'],
    default: 'available'
  },
  utilities: [{
    type: String,
    trim: true
  }],
  terms: {
    type: String,
    trim: true,
    maxlength: [2000, 'Terms cannot be more than 2000 characters']
  },
  // hostId: {
  //   type: String,
  //   required: [true, 'Please specify host ID'],
  //   ref: 'User'
  //   /*type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User', // tên model User
  //   required: true*/
  // },
  hostId: {
    type: String,
    required: [true, 'Please specify host ID']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt before saving
roomSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
roomSchema.index({ location: 1, roomType: 1, status: 1 });
roomSchema.index({ price: 1, area: 1 });
roomSchema.index({ hostId: 1 });

module.exports = mongoose.model('Room', roomSchema);