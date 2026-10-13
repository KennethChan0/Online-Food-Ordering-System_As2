const express = require('express');
const router = express.Router();

const {
  getCustomerReservations,
  updateReservationStatus
} = require('../controllers/staffReservationController');

const { protect } = require('../middleware/authMiddleware');

// US21 - Staff view customer reservations
router.get('/', protect, getCustomerReservations);

// US22 - Staff update reservation status
router.patch('/:id/status', protect, updateReservationStatus);

module.exports = router;
