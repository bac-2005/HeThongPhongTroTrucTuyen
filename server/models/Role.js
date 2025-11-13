const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  roleId: {
    type: String,
    unique: true,
    immutable: true  
  },
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'host', 'tenant'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  assignedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Tự sinh roleId duy nhất trước khi validate
roleSchema.pre('validate', async function (next) {
  if (!this.roleId) {
    const Role = mongoose.model('Role');
    const lastRole = await Role.findOne().sort({ roleId: -1 });
    let nextNumber = 1;

    if (lastRole && lastRole.roleId) {
      const num = parseInt(lastRole.roleId.replace('role', ''), 10);
      if (!isNaN(num)) {
        nextNumber = num + 1;
      }
    }

    this.roleId = `role${String(nextNumber).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Role', roleSchema);
