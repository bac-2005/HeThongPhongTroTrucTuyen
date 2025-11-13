const express = require('express');
const {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomsByHost,
  getMyRooms,
  searchRoomsRegex,
  updateRoomStatus,
  searchRooms
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/searchRoom', searchRoomsRegex);
router.get('/host/:hostId', getRoomsByHost);
router.get('/my/rooms', protect, authorize('host'), getMyRooms);
router.patch('/:id/status', protect, authorize('host', 'admin'), updateRoomStatus);
router.get('/search', searchRooms);
router.route('/')
  .get(protect, getRooms)
  .post(protect, authorize('host', 'admin'), createRoom);

router.route('/:id')
  .get(getRoom)
  .put(protect, authorize('host', 'admin'), updateRoom)
  .delete(protect, authorize('host', 'admin'), deleteRoom);

module.exports = router;
