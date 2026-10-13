const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');

// US21 - Restaurant staff view customer reservations
const getCustomerReservations = async (req, res) => {
  try {
    // Only restaurant staff can view customer reservations
    if (!req.user || req.user.role !== 'restaurant') {
      return res.status(403).json({
        message: 'Only restaurant staff can view customer reservations.'
      });
    }

    // Get customer reservations from the database
    const reservations = await Reservation.find({})
      .select(
        'fullName phoneNumber email reservationDate reservationTime numberOfGuests specialRequests status'
      )
      .sort({
        reservationDate: 1,
        reservationTime: 1
      });

    // No reservations available
    if (reservations.length === 0) {
      return res.status(200).json({
        message: 'No customer reservations found.',
        reservations: []
      });
    }

    // Return reservation details
    return res.status(200).json({
      message: 'Customer reservations retrieved successfully.',
      reservations
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Unable to retrieve customer reservations.'
    });
  }
};

// US22 - Restaurant staff update reservation status
const updateReservationStatus = async (req, res) => {
  try {
    // Only restaurant staff can update reservation status
    if (!req.user || req.user.role !== 'restaurant') {
      return res.status(403).json({
        message: 'Only restaurant staff can update reservation status.'
      });
    }

    const { id } = req.params;
    const { status } = req.body || {};

    // Check reservation ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid reservation ID.'
      });
    }

    // Check allowed status values
    if (!['Confirmed', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be Confirmed or Cancelled.'
      });
    }

    // Find the reservation
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({
        message: 'Reservation not found.'
      });
    }

    // Do not change an already cancelled reservation
    if (reservation.status === 'Cancelled') {
      return res.status(400).json({
        message: 'Cancelled reservations cannot be updated.'
      });
    }

    // Do not update to the same status
    if (reservation.status === status) {
      return res.status(400).json({
        message: 'Reservation already has this status.'
      });
    }

    // Update and save the new status
    reservation.status = status;

    const updatedReservation = await reservation.save();

    return res.status(200).json({
      message: 'Reservation status updated successfully.',
      reservation: updatedReservation
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Unable to update reservation status.'
    });
  }
};

module.exports = {
  getCustomerReservations,
  updateReservationStatus
};
