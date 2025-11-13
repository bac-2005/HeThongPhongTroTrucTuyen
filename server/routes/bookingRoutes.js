const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createBooking,
  getAllBookings,
  getMyBookings,
  updateBookingStatus,
  deleteBooking,
  getHostBookings,
  approveBooking,
  rejectBooking,
} = require('../controllers/bookingController');

const router = express.Router();

// Tạo booking mới
router.post('/', protect, authorize('tenant'), createBooking);

// Lấy tất cả booking (admin)
router.get('/', protect, authorize('admin'), getAllBookings);
// ✅ Booking của host (tất cả phòng của host)
router.get('/host', protect, authorize('host', 'admin'), getHostBookings);
// Lấy booking của chính người dùng
router.get('/my-bookings', protect, getMyBookings);

// Cập nhật trạng thái booking
router.put('/:bookingId', protect, authorize('host', 'admin'), updateBookingStatus);

router.delete('/:bookingId', protect, deleteBooking);

router.put('/:id/approve', protect, authorize('host', 'admin'), approveBooking);

router.put('/:id/reject',  protect, authorize('host', 'admin'), rejectBooking);
module.exports = router;
