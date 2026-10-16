const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  reservationDate: {
    type: String,
    required: true
  },
  reservationTime: {
    type: String,
    required: true
  },
  numberOfGuests: {
    type: Number,
    required: true,
    min: 1
  },
  specialRequests: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled'],
    default: 'Pending'
  }
});

// US20 - Encapsulation: Check whether a customer can edit this reservation
reservationSchema.methods.canCustomerEdit = function () {
  return this.status === 'Pending';
};

// US20 - Encapsulation: Check whether a customer can cancel this reservation
reservationSchema.methods.canCustomerCancel = function (currentTime = Date.now()) {

  // Cancelled reservations cannot be cancelled again.
  if (this.status === 'Cancelled') {
    return {
      allowed: false,
      message: 'Reservation is already cancelled.'
    };
  }

  // Pending reservations can be cancelled.
  if (this.status === 'Pending') {
    return { allowed: true };
  }

  // Confirmed reservations require at least 24 hours' notice.
  if (this.status === 'Confirmed') {

    // Brisbane uses UTC+10 throughout the year.
    const reservationDateTime = new Date(
      `${this.reservationDate}T${this.reservationTime}:00+10:00`
    );

    if (Number.isNaN(reservationDateTime.getTime())) {
      return {
        allowed: false,
        message: 'Reservation date or time is invalid.'
      };
    }

    const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

    const timeUntilReservation =
      reservationDateTime.getTime() - currentTime;

    // Exactly 24 hours before the reservation is allowed.
    if (timeUntilReservation < twentyFourHoursInMs) {
      return {
        allowed: false,
        message: 'Confirmed reservations can only be cancelled at least 24 hours before the reservation time.'
      };
    }

    return { allowed: true };
  }

  return {
    allowed: false,
    message: 'This reservation cannot be cancelled.'
  };
};

module.exports = mongoose.model('Reservation', reservationSchema);
