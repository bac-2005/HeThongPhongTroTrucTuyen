const express = require('express');
const {
  createRoomRequest,
  getRoomRequests,
  updateRoomRequest
} = require('../controllers/roomRequestController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Gửi yêu cầu thuê phòng (chỉ người thuê)
router.post('/', protect, authorize('tenant'), createRoomRequest);

// Lấy danh sách yêu cầu theo vai trò (admin, host, tenant)
router.get('/', protect, getRoomRequests);

// Cập nhật trạng thái yêu cầu (admin, host)
router.put('/:id', protect, authorize('admin', 'host'), updateRoomRequest);

module.exports = router;
