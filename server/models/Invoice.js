const mongoose = require('mongoose');
const { generateInvoiceId } = require('../utils/generateId');

const invoiceItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['room', 'electricity', 'water', 'service', 'other'],
    required: true,
  },
  quantity: { type: Number, default: 1, min: 0 },   
  unitPrice: { type: Number, required: true, min: 0 },
  amount: { type: Number, min: 0 },                
  note: { type: String, trim: true, maxlength: 500 },
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    unique: true,
    default: generateInvoiceId,
    immutable: true,
  },
  contractId: { type: String, required: true, ref: 'Contract' },
  roomId:     { type: String, required: true, ref: 'Room' },
  userId:     { type: String, required: true, ref: 'User' },

  // YYYY-MM
  billingMonth: { type: String, match: /^\d{4}-(0[1-9]|1[0-2])$/ },

  items: {
    type: [invoiceItemSchema],
    validate: v => Array.isArray(v) && v.length > 0,
  },

  totalAmount: { type: Number, min: 0, default: 0 },
  status: {
    type: String,
    enum: ['unpaid', 'paid', 'pending'],
    default: 'pending',
  },
  note: { type: String, trim: true, maxlength: 500 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { minimize: true });

invoiceSchema.index(
  { contractId: 1, billingMonth: 1 },
  { unique: true, partialFilterExpression: { billingMonth: { $exists: true } } }
);

invoiceSchema.pre('validate', function (next) {
  if (Array.isArray(this.items)) {
    this.items = this.items.map(it => {
      const qty = typeof it.quantity === 'number' ? it.quantity : 1;
      const price = typeof it.unitPrice === 'number' ? it.unitPrice : 0;
      if (it.amount == null) it.amount = Number((qty * price).toFixed(2));
      return it;
    });
    this.totalAmount = this.items.reduce((s, it) => s + (it.amount || 0), 0);
  }
  next();
});

invoiceSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
