const { VNPay } = require('vnpay');

module.exports = new VNPay({
  tmnCode: process.env.VNP_TMN_CODE,
  secureSecret: process.env.VNP_HASH_SECRET,
  testMode: true,
  vnpayHost: 'https://sandbox.vnpayment.vn',
  queryDrAndRefundHost: 'https://sandbox.vnpayment.vn',
});
