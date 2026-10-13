const express = require('express');
const router = express.Router();

const {
  getCustomerReservations
} = require('../controllers/staffReservationController');

const { protect } = require('../middleware/authMiddleware');

// US21 - Staff view customer reservations
router.get('/', protect, getCustomerReservations);

module.exports = router;
