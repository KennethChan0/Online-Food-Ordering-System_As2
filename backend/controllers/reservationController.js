const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');

// US19 - Create a reservation
const createReservation = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Please log in to make a reservation.'
      });
    }

    if (req.user.role !== 'customer') {
      return res.status(403).json({
        message: 'Only customers can make reservations.'
      });
    }

    const {
      fullName,
      phoneNumber,
      email,
      reservationDate,
      reservationTime,
      numberOfGuests,
      specialRequests
    } = req.body || {};

    if (
      !fullName || !phoneNumber || !email ||
      !reservationDate || !reservationTime || !numberOfGuests
    ) {
      return res.status(400).json({
        message: 'Please complete all required fields.'
      });
    }

    if (
      typeof fullName !== 'string' ||
      typeof phoneNumber !== 'string' ||
      typeof email !== 'string' ||
      typeof reservationDate !== 'string' ||
      typeof reservationTime !== 'string'
    ) {
      return res.status(400).json({
        message: 'Please enter valid reservation details.'
      });
    }

    const namePattern = /^[\p{L}\s'-]+$/u;

    if (!namePattern.test(fullName.trim())) {
      return res.status(400).json({
        message: 'Please enter a valid name.'
      });
    }

    const phonePattern = /^0\d{9}$/;

    if (!phonePattern.test(phoneNumber)) {
      return res.status(400).json({
        message: 'Please enter a valid 10-digit Australian phone number.'
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        message: 'Please enter a valid email.'
      });
    }

    if (
      !Number.isInteger(Number(numberOfGuests)) ||
      Number(numberOfGuests) < 1
    ) {
      return res.status(400).json({
        message: 'Number of guests must be a positive whole number.'
      });
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(reservationDate)) {
      return res.status(400).json({
        message: 'Please enter a valid reservation date.'
      });
    }

    const [year, month, day] = reservationDate.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (
      selectedDate.getFullYear() !== year ||
      selectedDate.getMonth() !== month - 1 ||
      selectedDate.getDate() !== day ||
      selectedDate < today
    ) {
      return res.status(400).json({
        message: 'Please select a valid date that is not in the past.'
      });
    }

    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!timePattern.test(reservationTime)) {
      return res.status(400).json({
        message: 'Please enter a valid reservation time.'
      });
    }

    const [hour, minute] = reservationTime.split(':').map(Number);

    if (minute % 30 !== 0) {
      return res.status(400).json({
        message: 'Reservation time must use 30-minute intervals.'
      });
    }

    const totalMinutes = hour * 60 + minute;
    const openingTime = 11 * 60;
    const closingTime = 20 * 60;

    if (totalMinutes < openingTime || totalMinutes > closingTime) {
      return res.status(400).json({
        message: 'Reservation time must be between 11:00 and 20:00.'
      });
    }

    const savedReservation = await Reservation.create({
      customer: req.user._id,
      fullName: fullName.trim(),
      phoneNumber,
      email: email.trim(),
      reservationDate,
      reservationTime,
      numberOfGuests: Number(numberOfGuests),
      specialRequests: specialRequests || ''
    });

    return res.status(201).json({
      message: 'Reservation created successfully.',
      reservation: savedReservation
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Unable to create reservation.'
    });
  }
};

// US20 - View own reservations
const getMyReservations = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Please log in to view your reservations.'
      });
    }

    if (req.user.role !== 'customer') {
      return res.status(403).json({
        message: 'Only customers can view their reservations.'
      });
    }

    const reservations = await Reservation.find({
      customer: req.user._id
    }).sort({
      reservationDate: 1,
      reservationTime: 1
    });

    if (reservations.length === 0) {
      return res.status(200).json({
        message: 'No reservations found.',
        reservations: []
      });
    }

    return res.status(200).json({
      message: 'Reservations retrieved successfully.',
      reservations
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Unable to retrieve reservations.'
    });
  }
};

// US20 - Update own reservation
const updateMyReservation = async (req, res) => {
  try {
    const reservation = req.reservation;

    // US20 - Use the Reservation Model's encapsulated edit rule.
    if (!reservation.canCustomerEdit()) {
      return res.status(400).json({
        message: 'Only pending reservations can be updated.'
      });
    }

    // The update form must send all required booking details
    const {
      fullName,
      phoneNumber,
      email,
      reservationDate,
      reservationTime,
      numberOfGuests,
      specialRequests
    } = req.body || {};

    if (
      !fullName || !phoneNumber || !email ||
      !reservationDate || !reservationTime || !numberOfGuests
    ) {
      return res.status(400).json({
        message: 'Please complete all required fields.'
      });
    }

    if (
      typeof fullName !== 'string' ||
      typeof phoneNumber !== 'string' ||
      typeof email !== 'string' ||
      typeof reservationDate !== 'string' ||
      typeof reservationTime !== 'string' ||
      (specialRequests != null && typeof specialRequests !== 'string')
    ) {
      return res.status(400).json({
        message: 'Please enter valid reservation details.'
      });
    }

    const namePattern = /^[\p{L}\s'-]+$/u;

    if (!namePattern.test(fullName.trim())) {
      return res.status(400).json({
        message: 'Please enter a valid name.'
      });
    }

    const phonePattern = /^0\d{9}$/;

    if (!phonePattern.test(phoneNumber)) {
      return res.status(400).json({
        message: 'Please enter a valid 10-digit Australian phone number.'
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        message: 'Please enter a valid email.'
      });
    }

    if (
      !Number.isInteger(Number(numberOfGuests)) ||
      Number(numberOfGuests) < 1
    ) {
      return res.status(400).json({
        message: 'Number of guests must be a positive whole number.'
      });
    }

    // Backend keeps ISO format: YYYY-MM-DD
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(reservationDate)) {
      return res.status(400).json({
        message: 'Please enter a valid reservation date.'
      });
    }

    const [year, month, day] = reservationDate.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (
      selectedDate.getFullYear() !== year ||
      selectedDate.getMonth() !== month - 1 ||
      selectedDate.getDate() !== day ||
      selectedDate < today
    ) {
      return res.status(400).json({
        message: 'Please select a valid date that is not in the past.'
      });
    }

    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!timePattern.test(reservationTime)) {
      return res.status(400).json({
        message: 'Please enter a valid reservation time.'
      });
    }

    const [hour, minute] = reservationTime.split(':').map(Number);

    if (minute % 30 !== 0) {
      return res.status(400).json({
        message: 'Reservation time must use 30-minute intervals.'
      });
    }

    const totalMinutes = hour * 60 + minute;

    if (totalMinutes < 11 * 60 || totalMinutes > 20 * 60) {
      return res.status(400).json({
        message: 'Reservation time must be between 11:00 and 20:00.'
      });
    }

    // Update booking details, but not the customer ID or status
    reservation.fullName = fullName.trim();
    reservation.phoneNumber = phoneNumber;
    reservation.email = email.trim();
    reservation.reservationDate = reservationDate;
    reservation.reservationTime = reservationTime;
    reservation.numberOfGuests = Number(numberOfGuests);
    reservation.specialRequests = specialRequests || '';

    const updatedReservation = await reservation.save();

    return res.status(200).json({
      message: 'Reservation updated successfully.',
      reservation: updatedReservation
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Unable to update reservation.'
    });
  }
};

// US20 - Cancel own reservation
const cancelMyReservation = async (req, res) => {
  try {
    const reservation = req.reservation;

    // US20 - Use the Reservation Model's encapsulated cancellation rule.
    const cancellationResult = reservation.canCustomerCancel();

    if (!cancellationResult.allowed) {
      return res.status(400).json({
        message: cancellationResult.message
      });
    }

    // Keep the booking record and update its status
    reservation.status = 'Cancelled';

    const cancelledReservation = await reservation.save();

    return res.status(200).json({
      message: 'Reservation cancelled successfully.',
      reservation: cancelledReservation
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Unable to cancel reservation.'
    });
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  updateMyReservation,
  cancelMyReservation
};
