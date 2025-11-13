const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true
  },
  fullName: {
    type: String,
    required: [true, 'Please add a full name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9]{10,11}$/, 'Please add a valid phone number']
  },
  role: {
    type: String,
    enum: ['guest', 'tenant', 'host', 'admin'],
    default: 'guest'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active'
  },
  avatar: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Address cannot be more than 200 characters']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  dob: {
    type: Date
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

// Tạo userId tăng dần kiểu user001, user002...
userSchema.pre('save', async function (next) {
  if (this.isNew) {
    // Lấy userId lớn nhất hiện tại
    const lastUser = await this.constructor.findOne({})
      .sort({ userId: -1 })
      .collation({ locale: "en_US", numericOrdering: true }); // Sắp xếp số đúng thứ tự

    let nextNumber = 1;
    if (lastUser && lastUser.userId) {
      const lastNumber = parseInt(lastUser.userId.replace('user', ''), 10);
      nextNumber = lastNumber + 1;
    }

    this.userId = 'user' + String(nextNumber).padStart(3, '0'); // Ví dụ user001
  }
  next();
});

// Mã hóa mật khẩu
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Cập nhật updatedAt
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// So khớp mật khẩu
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
