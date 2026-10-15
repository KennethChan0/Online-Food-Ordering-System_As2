const express = require('express');
const router = express.Router();

const {
  createReservation,
  getMyReservations,
  updateMyReservation,
  cancelMyReservation
} = require('../controllers/reservationController');

const { protect } = require('../middleware/authMiddleware');

// US19 - Create reservation
router.post('/', protect, createReservation);

// US20 - View own reservations
router.get('/my', protect, getMyReservations);

// US20 - Update own reservation
router.put('/:id', protect, updateMyReservation);

// US20 - Cancel own reservation
router.patch('/:id/cancel', protect, cancelMyReservation);

module.exports = router;
