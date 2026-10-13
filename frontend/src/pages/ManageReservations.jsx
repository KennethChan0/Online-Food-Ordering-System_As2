import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

// Convert YYYY-MM-DD to Australian DD/MM/YYYY
const formatDateAU = (isoDate) => {
  if (!isoDate) return '';

  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

// Convert Australian date to backend format
const convertDateToISO = (australianDate) => {
  const match = australianDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const selectedDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

const ManageReservations = () => {
  const { user } = useAuth();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Load reservations belonging to the logged-in customer
  useEffect(() => {
    if (!user?.token || user.role !== 'customer') {
      setLoading(false);
      return;
    }

    let active = true;

    const loadReservations = async () => {
      try {
        const response = await axiosInstance.get(
          '/api/reservations/my',
          {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          }
        );

        if (active) {
          setReservations(response.data.reservations || []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
            'Unable to load reservations.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadReservations();

    return () => {
      active = false;
    };
  }, [user?.token, user?.role]);

  // Open the edit form with existing booking details
  const handleEdit = (reservation) => {
    setEditingId(reservation._id);
    setSuccess('');
    setError('');

    setEditForm({
      fullName: reservation.fullName,
      phoneNumber: reservation.phoneNumber,
      email: reservation.email,
      reservationDate: formatDateAU(reservation.reservationDate),
      reservationTime: reservation.reservationTime,
      numberOfGuests: reservation.numberOfGuests,
      specialRequests: reservation.specialRequests || ''
    });
  };

  const handleChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  // Save changes to the customer's own reservation
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    const isoDate = convertDateToISO(editForm.reservationDate);

    if (!isoDate) {
      setError('Please enter a valid future date in DD/MM/YYYY format.');
      return;
    }

    if (
      !Number.isInteger(Number(editForm.numberOfGuests)) ||
      Number(editForm.numberOfGuests) < 1
    ) {
      setError('Number of guests must be a positive whole number.');
      return;
    }

    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!timePattern.test(editForm.reservationTime)) {
      setError('Please enter a valid reservation time.');
      return;
    }

    const [hour, minute] = editForm.reservationTime.split(':').map(Number);

    if (
      minute % 5 !== 0 ||
      hour * 60 + minute < 11 * 60 ||
      hour * 60 + minute > 20 * 60
    ) {
      setError('Reservation time must be between 11:00 and 20:00, using 5-minute intervals.');
      return;
    }

    try {
      setSaving(true);

      const response = await axiosInstance.put(
        `/api/reservations/${editingId}`,
        {
          ...editForm,
          reservationDate: isoDate,
          numberOfGuests: Number(editForm.numberOfGuests)
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      // Update the reservation displayed on the page
      setReservations((previous) =>
        previous.map((reservation) =>
          reservation._id === editingId
            ? response.data.reservation
            : reservation
        )
      );

      setEditingId(null);
      setSuccess(response.data.message);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to update reservation.'
      );
    } finally {
      setSaving(false);
    }
  };

  // Cancel the customer's own reservation
  const handleCancel = async (reservationId) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this reservation?'
    );

    if (!confirmed) return;

    setSuccess('');
    setError('');

    try {
      setSaving(true);

      const response = await axiosInstance.patch(
        `/api/reservations/${reservationId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      // Keep the reservation but display its new status
      setReservations((previous) =>
        previous.map((reservation) =>
          reservation._id === reservationId
            ? response.data.reservation
            : reservation
        )
      );

      if (editingId === reservationId) {
        setEditingId(null);
      }

      setSuccess(response.data.message);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to cancel reservation.'
      );
    } finally {
      setSaving(false);
    }
  };

  // User must be logged in
  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4">My Reservations</h1>
        <p>Please log in to view your reservations.</p>
        <Link to="/login" className="text-blue-600">
          Go to Login
        </Link>
      </div>
    );
  }

  // Only customers can manage their own reservations
  if (user.role !== 'customer') {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-md rounded">
        <p>Only customers can manage their own reservations.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6">
        My Reservations
      </h1>

      {success && (
        <p role="status" className="bg-green-100 text-green-700 p-3 rounded mb-4">
          {success}
        </p>
      )}

      {error && (
        <p role="alert" className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </p>
      )}

      {loading && <p>Loading reservations...</p>}

      {!loading && !error && reservations.length === 0 && (
        <div className="bg-white shadow-md rounded p-6">
          <p>No reservations found.</p>
          <Link
            to="/reservations/new"
            className="text-blue-600"
          >
            Create a Reservation
          </Link>
        </div>
      )}

      {!loading && reservations.map((reservation) => (
        <div
          key={reservation._id}
          className="bg-white shadow-md rounded p-6 mb-5"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">
              Reservation
            </h2>
            <span className="font-semibold">
              {reservation.status}
            </span>
          </div>

          {editingId === reservation._id ? (
            <form onSubmit={handleUpdate}>

              <label className="block mb-2">Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={editForm.fullName}
                onChange={handleChange}
                required
                className="w-full mb-4 p-2 border rounded"
              />

              <label className="block mb-2">Phone Number *</label>
              <input
                type="tel"
                name="phoneNumber"
                value={editForm.phoneNumber}
                onChange={handleChange}
                pattern="0[0-9]{9}"
                required
                className="w-full mb-4 p-2 border rounded"
              />

              <label className="block mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleChange}
                required
                className="w-full mb-4 p-2 border rounded"
              />

              <label className="block mb-2">
                Reservation Date (DD/MM/YYYY) *
              </label>
              <input
                type="text"
                name="reservationDate"
                value={editForm.reservationDate}
                onChange={handleChange}
                placeholder="DD/MM/YYYY"
                pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}"
                required
                className="w-full mb-4 p-2 border rounded"
              />

              <label className="block mb-2">Reservation Time *</label>
              <input
                type="time"
                name="reservationTime"
                value={editForm.reservationTime}
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
                value={editForm.numberOfGuests}
                onChange={handleChange}
                min="1"
                step="1"
                required
                className="w-full mb-4 p-2 border rounded"
              />

              <label className="block mb-2">Special Requests</label>
              <textarea
                name="specialRequests"
                value={editForm.specialRequests}
                onChange={handleChange}
                rows="3"
                className="w-full mb-4 p-2 border rounded"
              />

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  Save Changes
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setEditingId(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Back
                </button>
              </div>

            </form>
          ) : (
            <>
              <p className="mb-2">
                <strong>Name:</strong> {reservation.fullName}
              </p>
              <p className="mb-2">
                <strong>Phone:</strong> {reservation.phoneNumber}
              </p>
              <p className="mb-2">
                <strong>Email:</strong> {reservation.email}
              </p>
              <p className="mb-2">
                <strong>Date:</strong> {formatDateAU(reservation.reservationDate)}
              </p>
              <p className="mb-2">
                <strong>Time:</strong> {reservation.reservationTime}
              </p>
              <p className="mb-2">
                <strong>Guests:</strong> {reservation.numberOfGuests}
              </p>
              <p className="mb-4">
                <strong>Special Requests:</strong>{' '}
                {reservation.specialRequests || 'None'}
              </p>

              {reservation.status !== 'Cancelled' && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleEdit(reservation)}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleCancel(reservation._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Cancel Reservation
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ManageReservations;
