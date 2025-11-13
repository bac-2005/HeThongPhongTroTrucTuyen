const { v4: uuidv4 } = require('uuid');

const generateId = (prefix = '') => {
  const uuid = uuidv4().replace(/-/g, '').substring(0, 8);
  return prefix ? `${prefix}_${uuid}` : uuid;
};

const generateUserId = () => generateId('user');
const generateRoomId = () => generateId('room');
const generateBookingId = () => generateId('booking');
const generateContractId = () => generateId('contract');
const generatePaymentId = () => generateId('payment');
const generateMessageId = () => generateId('msg');
const generateRequestId = () => generateId('req');
const generateApprovalId = () => generateId('approval');
const generateTransactionId = () => generateId('trans');
const generateReviewId = () => generateId('review');
const generateReportId = () => generateId('report');
const generateNotificationId = () => generateId('notif');
const generateInvoiceId = () => generateId('invoice');

module.exports = {
  generateId,
  generateUserId,
  generateRoomId,
  generateBookingId,
  generateContractId,
  generatePaymentId,
  generateMessageId,
  generateRequestId,
  generateApprovalId,
  generateTransactionId,
  generateReviewId,
  generateReportId,
  generateNotificationId,
  generateInvoiceId
};