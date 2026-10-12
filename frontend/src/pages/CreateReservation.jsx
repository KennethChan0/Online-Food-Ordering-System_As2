import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

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

  // Get today's local date for the date input
  const today = new Date();
  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-');

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

    if (!user?.token) {
      setError('Please log in to make a reservation.');
      return;
    }

    if (user.role !== 'customer') {
      setError('Only customers can make reservations.');
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

    try {
      setLoading(true);

      const response = await axiosInstance.post(
        '/api/reservations',
        {
          ...formData,
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

      // Clear booking details after successful submission
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

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4">Create Reservation</h1>
        <p>Please log in before making a reservation.</p>
        <Link to="/login" className="text-blue-600">
          Go to Login
        </Link>
      </div>
    );
  }

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

        <label className="block mb-2">Reservation Date *</label>
        <input
          type="date"
          name="reservationDate"
          value={formData.reservationDate}
          onChange={handleChange}
          min={minDate}
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
