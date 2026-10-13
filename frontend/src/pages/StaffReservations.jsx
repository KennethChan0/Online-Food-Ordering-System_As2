import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

// Display dates in Australian format
const formatDateAU = (date) => {
  if (!date) return 'N/A';

  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

// Check whether a reservation is upcoming
const isUpcoming = (reservation) => {
  if (reservation.status === 'Cancelled') {
    return false;
  }

  const [year, month, day] = reservation.reservationDate
    .split('-').map(Number);

  const [hour, minute] = reservation.reservationTime
    .split(':').map(Number);

  const bookingDate = new Date(
    year, month - 1, day, hour, minute
  );

  return bookingDate >= new Date();
};

const StaffReservations = () => {
  const { user } = useAuth();

  const [reservations, setReservations] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get customer reservations from the staff API
  useEffect(() => {
    if (!user?.token || user.role !== 'restaurant') {
      setLoading(false);
      return;
    }

    let active = true;

    const loadReservations = async () => {
      try {
        const response = await axiosInstance.get(
          '/api/staff/reservations',
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
            'Unable to load customer reservations.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadReservations();

    return () => {
      active = false;
    };
  }, [user?.token, user?.role]);

  // Show login message
  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4">
          Customer Reservations
        </h1>
        <p>Please log in to view customer reservations.</p>
        <Link to="/login" className="text-blue-600">
          Go to Login
        </Link>
      </div>
    );
  }

  // Only restaurant staff can access this page
  if (user.role !== 'restaurant') {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4">
          Customer Reservations
        </h1>
        <p>Only restaurant staff can view customer reservations.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6">
        Customer Reservations
      </h1>

      {loading && (
        <p>Loading customer reservations...</p>
      )}

      {error && (
        <p role="alert" className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </p>
      )}

      {!loading && !error && reservations.length === 0 && (
        <div className="bg-white shadow-md rounded p-6">
          <p>No customer reservations found.</p>
        </div>
      )}

      {!loading && reservations.map((reservation) => (
        <div
          key={reservation._id}
          className="bg-white shadow-md rounded p-6 mb-4"
        >
          {/* Reservation summary */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-bold">
                {reservation.fullName}
              </h2>
              <p>
                Date: {formatDateAU(reservation.reservationDate)}
              </p>
              <p>
                Time: {reservation.reservationTime}
              </p>
              <p>
                Guests: {reservation.numberOfGuests}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold">
                {reservation.status}
              </p>

              {isUpcoming(reservation) && (
                <p className="text-blue-600 text-sm">
                  Upcoming
                </p>
              )}
            </div>
          </div>

          {/* Show or hide full reservation details */}
          <button
            type="button"
            onClick={() =>
              setExpandedId(
                expandedId === reservation._id
                  ? null
                  : reservation._id
              )
            }
            aria-expanded={expandedId === reservation._id}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {expandedId === reservation._id
              ? 'Hide Details'
              : 'View Details'}
          </button>

          {expandedId === reservation._id && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-bold mb-3">
                Reservation Details
              </h3>

              <p className="mb-2">
                <strong>Full Name:</strong> {reservation.fullName}
              </p>

              <p className="mb-2">
                <strong>Phone Number:</strong> {reservation.phoneNumber}
              </p>

              <p className="mb-2">
                <strong>Email:</strong> {reservation.email}
              </p>

              <p className="mb-2">
                <strong>Reservation Date:</strong>{' '}
                {formatDateAU(reservation.reservationDate)}
              </p>

              <p className="mb-2">
                <strong>Reservation Time:</strong>{' '}
                {reservation.reservationTime}
              </p>

              <p className="mb-2">
                <strong>Number of Guests:</strong>{' '}
                {reservation.numberOfGuests}
              </p>

              <p className="mb-2">
                <strong>Special Requests:</strong>{' '}
                {reservation.specialRequests || 'None'}
              </p>

              <p className="mb-2">
                <strong>Reservation Status:</strong>{' '}
                {reservation.status}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StaffReservations;