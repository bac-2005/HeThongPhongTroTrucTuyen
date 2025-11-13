const Approval = require('../models/RoomApproval');

// POST /approvals
exports.addApproval = async (req, res) => {
  try {
    const {
      approvalId,          // optional, nếu không truyền sẽ auto APPxxx
      roomId,              // required
      status = 'pending',  // 'pending' | 'approved' | 'rejected'
      note,                // ✅ mới thêm
      requestedBy          // optional: nếu có auth thì lấy từ req.user
    } = req.body;

    if (!roomId) {
      return res.status(400).json({ success: false, error: 'Thiếu roomId' });
    }
    if (!['pending','approved','rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Trạng thái không hợp lệ' });
    }

    const requester = req.user?._id || requestedBy;
    if (!requester) {
      return res.status(400).json({ success: false, error: 'Thiếu requestedBy' });
    }

    const doc = await Approval.create({
      approvalId,   // nếu không có, pre('save') sẽ tự sinh APP001...
      roomId,
      status,
      note,         // ✅ lưu note
      requestedBy: requester,
      requestedAt: new Date()
    });

    const populated = await Approval.findById(doc._id)
      .populate('requestedBy', 'name email');

    return res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error('addApproval error:', err);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
};
exports.updateApprovalStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Trạng thái không hợp lệ' });
    }

    const approval = await Approval.findOneAndUpdate(
      { approvalId: req.params.id },
      { status },
      { new: true, runValidators: true }
    );

    if (!approval) {
      return res.status(404).json({ success: false, error: 'Approval not found' });
    }

    res.status(200).json({ success: true, data: approval });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
// Lấy danh sách approvals
exports.getRoomApprovals = async (req, res) => {
  try {
    console.log('🔍 Bắt đầu lấy danh sách approvals...');
    
    const approvals = await Approval.find().populate('requestedBy', 'name email');

    res.status(200).json({
      success: true,
      count: approvals.length,
      data: approvals
    });
  } catch (err) {
    // console.error('❌ Lỗi khi lấy approvals:', err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Lấy chi tiết 1 approval theo approvalId
exports.getSingleApproval = async (req, res) => {
  try {
    // console.log(`🔍 Tìm approvalId: ${req.params.id}`);
    
    const approval = await Approval.findOne({ approvalId: req.params.id })
      .populate('requestedBy', 'name email');

    if (!approval) {
      console.warn('⚠️ Không tìm thấy approval');
      return res.status(404).json({ success: false, error: 'Approval not found' });
    }

    // console.log('📄 Dữ liệu tìm thấy:', approval);

    res.status(200).json({ success: true, data: approval });
  } catch (err) {
    // console.error('❌ Lỗi khi lấy approval:', err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

