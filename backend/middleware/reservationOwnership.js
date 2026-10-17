const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');

// US20 - Check that the reservation belongs to the logged-in customer.
const checkReservationOwnership = (action) => async (req, res, next) => {
  const isCancel = action === 'cancel';

  try {
    if (!req.user) {
      return res.status(401).json({
        message: isCancel
          ? 'Please log in to cancel your reservation.'
          : 'Please log in to update your reservation.'
      });
    }

    if (req.user.role !== 'customer') {
      return res.status(403).json({
        message: isCancel
          ? 'Only customers can cancel their reservations.'
          : 'Only customers can update their reservations.'
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid reservation ID.'
      });
    }

    const reservation = await Reservation.findOne({
      _id: req.params.id,
      customer: req.user._id
    });

    if (!reservation) {
      return res.status(404).json({
        message: 'Reservation not found.'
      });
    }

    req.reservation = reservation;
    return next();

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: isCancel
        ? 'Unable to cancel reservation.'
        : 'Unable to update reservation.'
    });
  }
};

module.exports = { checkReservationOwnership };
