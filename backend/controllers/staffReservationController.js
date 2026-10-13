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

module.exports = { getCustomerReservations };
