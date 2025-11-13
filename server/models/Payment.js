// models/Payment.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const PaymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, default: () => uuidv4(), index: true, immutable: true   },
    tenantId: { type: String, required: true },
    contractId: { type: String, required: true },
    invoiceId: { type: String, ref: 'Invoice' },
    amount: { type: Number, required: true },          // VND (chưa *100)
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    paymentDate: { type: Date },

    // VNPay fields
    vnpTxnRef: { type: String, index: true },
    vnpResponseCode: { type: String },
    vnpBankCode: { type: String },

    extraNote: { type: String },

    paidAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);
