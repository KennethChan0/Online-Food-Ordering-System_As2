const express = require('express');
const router = express.Router();

const { createReservation } = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');

// Create a reservation (logged-in users only)
router.post('/', protect, createReservation);

module.exports = router;
