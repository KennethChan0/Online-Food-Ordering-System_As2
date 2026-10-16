import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

// Get today's date in YYYY-MM-DD format
const getTodayISO = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

// Check valid date and prevent past dates
const isValidReservationDate = (isoDate) => {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const selectedDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    selectedDate.getFullYear() === year &&
    selectedDate.getMonth() === month - 1 &&
    selectedDate.getDate() === day &&
    selectedDate >= today
  );
};

// Reservation times: 11:00 AM to 8:00 PM, every 30 minutes
const reservationTimeOptions = Array.from({ length: 19 }, (_, index) => {
  const totalMinutes = 11 * 60 + index * 30;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;

  const value =
    `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  const displayHour = hour % 12 || 12;
  const period = hour >= 12 ? 'PM' : 'AM';

  const label =
    `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;

  return { value, label };
});

const CreateReservation = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: (user?.name || '').replace(/\p{N}/gu, ''),
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

  const todayISO = getTodayISO();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === 'fullName'
        ? value.replace(/\p{N}/gu, '')
        : value
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

    // Check reservation date
    // Date picker already uses YYYY-MM-DD format
    const isoDate = formData.reservationDate;

    if (!isValidReservationDate(isoDate)) {
      setError('Please select a valid date that is not in the past.');
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
      setError('Please select a valid reservation time.');
      return;
    }

    const [hour, minute] = formData.reservationTime.split(':').map(Number);
    const totalMinutes = hour * 60 + minute;

    if (minute % 30 !== 0) {
      setError('Reservation time must use 30-minute intervals.');
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
          className="w-full mb-1 p-2 border rounded"
        />
        <p className="text-sm text-gray-600 mb-4">
          Letters, spaces, hyphens and apostrophes only. No numbers allowed.
        </p>

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

        <label className="block mb-2">Reservation Date *</label>
        <input
          type="date"
          name="reservationDate"
          value={formData.reservationDate}
          onChange={handleChange}
          min={todayISO}
          required
          className="w-full mb-4 p-2 border rounded"
        />

        <label className="block mb-2">Reservation Time *</label>
        <p className="text-sm text-gray-600 mb-2">
          Available from 11:00 AM to 8:00 PM (30-minute intervals).
        </p>

        <select
          name="reservationTime"
          value={formData.reservationTime}
          onChange={handleChange}
          required
          className="w-full mb-4 p-2 border rounded"
        >
          <option value="">Select a reservation time</option>

          {reservationTimeOptions.map((time) => (
            <option key={time.value} value={time.value}>
              {time.label}
            </option>
          ))}
        </select>

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
