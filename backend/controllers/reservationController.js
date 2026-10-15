const Reservation = require('../models/Reservation');

const createReservation = async (req, res) => {
  try {
    // Check if the user is logged in
    if (!req.user) {
      return res.status(401).json({
        message: 'Please log in to make a reservation.'
      });
    }

    // Only customers can create reservations
    if (req.user.role !== 'customer') {
      return res.status(403).json({
        message: 'Only customers can make reservations.'
      });
    }

    // Get reservation details from the request
    const {
      fullName,
      phoneNumber,
      email,
      reservationDate,
      reservationTime,
      numberOfGuests,
      specialRequests
    } = req.body || {};

    // Check required fields
    if (
      !fullName ||
      !phoneNumber ||
      !email ||
      !reservationDate ||
      !reservationTime ||
      !numberOfGuests
    ) {
      return res.status(400).json({
        message: 'Please complete all required fields.'
      });
    }

    // Check input types
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

    // Check name format
    const namePattern = /^[\p{L}\s'-]+$/u;

    if (!namePattern.test(fullName.trim())) {
      return res.status(400).json({
        message: 'Please enter a valid name.'
      });
    }

    // Check phone number format
    const phonePattern = /^0\d{9}$/;

    if (!phonePattern.test(phoneNumber)) {
      return res.status(400).json({
        message: 'Please enter a valid 10-digit Australian phone number.'
      });
    }

    // Check email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        message: 'Please enter a valid email.'
      });
    }

    // Check number of guests
    if (
      !Number.isInteger(Number(numberOfGuests)) ||
      Number(numberOfGuests) < 1
    ) {
      return res.status(400).json({
        message: 'Number of guests must be a positive whole number.'
      });
    }

    // Check reservation date format
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(reservationDate)) {
      return res.status(400).json({
        message: 'Please enter a valid reservation date.'
      });
    }

    // Check reservation date
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

    // Check reservation time format
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!timePattern.test(reservationTime)) {
      return res.status(400).json({
        message: 'Please enter a valid reservation time.'
      });
    }

    // Check 5-minute intervals
    const [hour, minute] = reservationTime.split(':').map(Number);

    if (minute % 5 !== 0) {
      return res.status(400).json({
        message: 'Reservation time must use 5-minute intervals.'
      });
    }

    // Check restaurant opening hours
    const totalMinutes = hour * 60 + minute;
    const openingTime = 11 * 60;
    const closingTime = 20 * 60;

    if (totalMinutes < openingTime || totalMinutes > closingTime) {
      return res.status(400).json({
        message: 'Reservation time must be between 11:00 and 20:00.'
      });
    }

    // Save reservation with the logged-in customer ID
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

    // Return the created reservation
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

module.exports = { createReservation };
