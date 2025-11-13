const Transaction = require('../models/Transaction');

// [POST] Tạo giao dịch
exports.createTransaction = async (req, res) => {
  try {
    const { receiverId, amount, content, method } = req.body;

    const transaction = new Transaction({
      senderId: req.user.userId,
      receiverId,
      amount,
      content,
      method
    });

    await transaction.save(); // pre-hook sẽ tự sinh transactionId

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    console.error('createTransaction error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// [GET] Lấy danh sách giao dịch
exports.getTransactions = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'tenant') query.senderId = req.user.userId;
    if (req.user.role === 'host') query.receiverId = req.user.userId;

    const transactions = await Transaction.find(query).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    console.error('getTransactions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// [GET] Lấy một giao dịch
exports.getSingleTransaction = async (req, res) => {
  try {
    const tran = await Transaction.findOne({ transactionId: req.params.id });
    if (!tran) return res.status(404).json({ success: false, message: 'Transaction not found' });

    // kiểm tra quyền truy cập
    if (req.user.role === 'tenant' && tran.senderId !== req.user.userId)
      return res.status(403).json({ success: false, message: 'Forbidden' });
    if (req.user.role === 'host' && tran.receiverId !== req.user.userId)
      return res.status(403).json({ success: false, message: 'Forbidden' });

    res.status(200).json({ success: true, data: tran });
  } catch (error) {
    console.error('getSingleTransaction error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// [PUT] Cập nhật trạng thái giao dịch
exports.updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const tran = await Transaction.findOne({ transactionId: req.params.id });
    if (!tran) return res.status(404).json({ success: false, message: 'Transaction not found' });

    tran.status = status || tran.status;
    await tran.save();

    res.status(200).json({ success: true, data: tran });
  } catch (error) {
    console.error('updateTransactionStatus error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
