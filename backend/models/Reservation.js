
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

module.exports = mongoose.model('Reservation', reservationSchema);