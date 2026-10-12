
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

// Convert Australian date DD/MM/YYYY to YYYY-MM-DD
const convertDateToISO = (australianDate) => {
  const match = australianDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const selectedDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check valid date and prevent past dates
  if (
    selectedDate.getFullYear() !== year ||
    selectedDate.getMonth() !== month - 1 ||
    selectedDate.getDate() !== day ||
    selectedDate < today
  ) {
    return null;
  }

  return `${match[3]}-${match[2]}-${match[1]}`;
};

const CreateReservation = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phoneNumber: '',
    email: user?.email || '',
    reservationDate: '',
    reservationTime: '',
    numberOfGuests: '1',
    specialRequests: ''
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    // Check login
    if (!user?.token) {
      setError('Please log in to make a reservation.');
      return;
    }

    // Check customer role
    if (user.role !== 'customer') {
      setError('Only customers can make reservations.');
      return;
    }

    // Convert DD/MM/YYYY to YYYY-MM-DD
    const isoDate = convertDateToISO(formData.reservationDate);

    if (!isoDate) {
      setError('Please enter a valid future date in DD/MM/YYYY format.');
      return;
    }

    // Check number of guests
    if (
      !Number.isInteger(Number(formData.numberOfGuests)) ||
      Number(formData.numberOfGuests) < 1
    ) {
      setError('Number of guests must be a positive whole number.');
      return;
    }

    // Check reservation time
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!timePattern.test(formData.reservationTime)) {
      setError('Please enter a valid reservation time.');
      return;
    }

    const [hour, minute] = formData.reservationTime.split(':').map(Number);
    const totalMinutes = hour * 60 + minute;

    if (minute % 5 !== 0) {
      setError('Reservation time must use 5-minute intervals.');
      return;
    }

    if (totalMinutes < 11 * 60 || totalMinutes > 20 * 60) {
      setError('Reservation time must be between 11:00 and 20:00.');
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.post(
        '/api/reservations',
        {
          ...formData,
          reservationDate: isoDate,
          numberOfGuests: Number(formData.numberOfGuests)
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      setSuccess(
        `${response.data.message} Status: ${response.data.reservation.status}.`
      );

      // Reset booking details after successful submission
      setFormData({
        ...formData,
        reservationDate: '',
        reservationTime: '',
        numberOfGuests: '1',
        specialRequests: ''
      });

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to create reservation. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Show login message if the user is not logged in
  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4">
          Create Reservation
        </h1>
        <p>Please log in before making a reservation.</p>
        <Link to="/login" className="text-blue-600">
          Go to Login
        </Link>
      </div>
    );
  }

  // Restaurant staff cannot create customer reservations
  if (user.role !== 'customer') {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-md rounded">
        <p>Only customers can make reservations.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Create Table Reservation
      </h1>

      <form onSubmit={handleSubmit}>

        <label className="block mb-2">Full Name *</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 border rounded"
        />

        <label className="block mb-2">Phone Number *</label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          pattern="0[0-9]{9}"
          title="Enter a 10-digit Australian phone number starting with 0"
          required
          className="w-full mb-4 p-2 border rounded"
        />

        <label className="block mb-2">Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 border rounded"
        />

        <label className="block mb-2">Reservation Date (DD/MM/YYYY) *</label>
        <input
          type="text"
          name="reservationDate"
          value={formData.reservationDate}
          onChange={handleChange}
          placeholder="DD/MM/YYYY"
          pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}"
          title="Enter the date in DD/MM/YYYY format"
          inputMode="numeric"
          required
          className="w-full mb-4 p-2 border rounded"
        />

        <label className="block mb-2">Reservation Time *</label>
        <input
          type="time"
          name="reservationTime"
          value={formData.reservationTime}
          onChange={handleChange}
          min="11:00"
          max="20:00"
          step="300"
          required
          className="w-full mb-4 p-2 border rounded"
        />

        <label className="block mb-2">Number of Guests *</label>
        <input
          type="number"
          name="numberOfGuests"
          value={formData.numberOfGuests}
          onChange={handleChange}
          min="1"
          step="1"
          required
          className="w-full mb-4 p-2 border rounded"
        />

        <label className="block mb-2">Special Requests</label>
        <textarea
          name="specialRequests"
          value={formData.specialRequests}
          onChange={handleChange}
          rows="3"
          className="w-full mb-4 p-2 border rounded"
        />

        {error && (
          <p role="alert" className="text-red-600 mb-4">
            {error}
          </p>
        )}

        {success && (
          <p role="status" className="text-green-600 mb-4">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Create Reservation'}
        </button>

      </form>
    </div>
  );
};

export default CreateReservation;