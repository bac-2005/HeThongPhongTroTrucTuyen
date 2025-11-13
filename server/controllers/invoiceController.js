const Invoice = require('../models/Invoice');

exports.getInvoices = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 10,
      status, contractId, userId, billingMonth,
      sortBy = 'createdAt', sortOrder = 'desc',
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (contractId) query.contractId = contractId;
    if (userId) query.userId = userId;
    if (billingMonth) query.billingMonth = billingMonth;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [items, total] = await Promise.all([
      Invoice.find(query).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
      Invoice.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        items,
        pagination: {
          currentPage: +page,
          totalPages: Math.ceil(total / +limit),
          totalItems: total,
          hasNextPage: skip + items.length < total,
          hasPrevPage: +page > 1,
        },
      },
    });
  } catch (err) { next(err); }
};

exports.getInvoicesByContract = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const items = await Invoice.find({ contractId }).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: items });
  } catch (err) { next(err); }
};
exports.getInvoicesByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const items = await Invoice.find({ userId }).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: items });
  } catch (err) { next(err); }
};

// body: { contractId, roomId, userId, billingMonth?, items:[{type, quantity, unitPrice, amount?, note?}], status?, note? }
exports.createInvoice = async (req, res, next) => {
  try {
    const { contractId, roomId, userId, billingMonth, items, status, note } = req.body;

    if (!contractId || !roomId || !userId) {
      return res.status(400).json({ success: false, message: 'Thiếu contractId/roomId/userId' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'items phải là mảng và không rỗng' });
    }

    for (const it of items) {
      if (!it?.type) return res.status(400).json({ success: false, message: 'Mỗi item cần type' });
      if (typeof it.unitPrice !== 'number') {
        return res.status(400).json({ success: false, message: 'Mỗi item cần unitPrice (number)' });
      }
      if ((it.type === 'electricity' || it.type === 'water') && typeof it.quantity !== 'number') {
        return res.status(400).json({ success: false, message: 'Điện/Nước cần quantity = số đã dùng' });
      }
      if (it.type === 'room' && (it.quantity == null)) {
        it.quantity = 1; 
      }
    }

    const created = await Invoice.create({
      contractId, roomId, userId,
      billingMonth,
      items, status, note,
    });

    res.status(201).json({ success: true, data: created });
  } catch (err) { next(err); }
};

exports.deleteInvoice = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const deleted = await Invoice.findOneAndDelete({ invoiceId }).lean();
    if (!deleted) return res.status(404).json({ success: false, message: 'Không tìm thấy invoice' });
    res.status(200).json({ success: true, message: 'Đã xóa', data: deleted });
  } catch (err) { next(err); }
};
