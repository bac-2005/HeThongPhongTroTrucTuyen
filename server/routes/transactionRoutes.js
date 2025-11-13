// routes/transactionRoutes.js

const express = require('express');
const {
  createTransaction,
  getTransactions,
  updateTransactionStatus,
  getSingleTransaction
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Tạo giao dịch
router.post('/', protect, createTransaction);

// Lấy danh sách giao dịch
router.get('/', protect, getTransactions);

// Cập nhật trạng thái giao dịch
router.put('/:id', protect, updateTransactionStatus);

// Lấy một giao dịch
router.get('/:id', protect, getSingleTransaction);

module.exports = router;
