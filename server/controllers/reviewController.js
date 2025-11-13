// controllers/reviewController.js
const Review = require('../models/Review');
const Room = require('../models/Room');
const User = require('../models/User');

// [POST] Tạo đánh giá mới
exports.createReview = async (req, res) => {
  try {
    const { roomId, review, rating, isRecommended, images } = req.body;
    const tenantId = req.user.userId; // Lấy userId từ token

    // Kiểm tra phòng tồn tại
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng.' });
    }

    // Kiểm tra user tồn tại
    const user = await User.findOne({ userId: tenantId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    const newReview = await Review.create({
      roomId,
      tenantId,
      review,
      rating,
      isRecommended,
      images
    });

    res.status(201).json({ success: true, data: newReview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [GET] Lấy đánh giá của 1 phòng
exports.getRoomReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ roomId: req.params.roomId, isApproved: true });
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [GET] Lấy tất cả đánh giá (Admin)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [PUT] Cập nhật đánh giá
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findOneAndUpdate(
      { reviewId: req.params.id, tenantId: req.user.userId },
      req.body,
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hoặc không có quyền cập nhật.' });
    }

    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [DELETE] Xoá đánh giá
exports.deleteReview = async (req, res) => {
  try {
    let condition = { reviewId: req.params.id };
    if (req.user.role !== 'admin') {
      condition.tenantId = req.user.userId;
    }

    const review = await Review.findOneAndDelete(condition);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hoặc không có quyền xoá.' });
    }

    res.json({ success: true, message: 'Xoá thành công.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [PUT] Duyệt hoặc huỷ duyệt đánh giá (Admin)
exports.approveReview = async (req, res) => {
  try {
    const review = await Review.findOneAndUpdate(
      { reviewId: req.params.id },
      { isApproved: req.body.isApproved },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá.' });
    }

    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
