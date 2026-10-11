import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { Navigate, useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth(); // Access user token from context
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    restaurantAddress: '',
    role: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const token = user?.token;

  useEffect(() => {
    if (!token) return;
    let active = true;

    // Fetch profile data from the backend
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axiosInstance.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (active) {
          setFormData({
            name: response.data.name,
            email: response.data.email,
            phone: response.data.phone || '',
            restaurantAddress: response.data.restaurantAddress || '',
            role: response.data.role || '',
          });
        }
      } catch (error) {
        if (active) {
          setError(error.response?.data?.message || 'Failed to fetch profile. Please try again.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      active = false;
    }
  }, [token]);

  const handleDelete = async () => {
      if (deleting) return;

      setDeleteError('');

      const confirmed = window.confirm(
        'Are you sure you want to delete your account? This is permanent and cannot be undone.'
      );

      if (!confirmed) return;

      setDeleting(true);

      try {
        const response = await axiosInstance.delete('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
          data: { confirmDelete: true },
        });

        logout();
        navigate('/login', { replace: true });
        window.alert(response.data.message);
      } catch (error) {
        setDeleteError(
          error.response?.data?.message ||
          'Failed to delete account. Please try again.'
        );
      } finally {
        setDeleting(false);
      }
    };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  if (error) {
    return (<div className="max-w-md mx-auto mt-20">
      <p role="alert" className="text-red-600 text-center">{error}</p>
    </div>);
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {formData.role === 'restaurant' ? 'Restaurant Profile' : 'Your Profile'}
        </h1>
        <label htmlFor='profile-name' className="block mb-1">
          {formData.role === 'restaurant' ? 'Restaurant Name' : 'Username'}
        </label>
        <input
          id="profile-name"
          type="text"
          placeholder="Name"
          value={formData.name}
          readOnly
          className="w-full mb-4 p-2 border rounded"
        />
        <label htmlFor='profile-email' className="block mb-1">
          Email
        </label>
        <input
          id="profile-email"
          type="email"
          placeholder="Email"
          value={formData.email}
          readOnly
          className="w-full mb-4 p-2 border rounded"
        />
        <label htmlFor='profile-phone' className="block mb-1">
          Phone
        </label>
        <input
          id="profile-phone"
          type="text"
          placeholder="Phone"
          value={formData.phone}
          readOnly
          className="w-full mb-4 p-2 border rounded"
        />
        {formData.role === 'restaurant' && (
          <>
            <label htmlFor='profile-restaurant-address' className="block mb-1">
              Restaurant Address
            </label>
            <input
              id="profile-restaurant-address"
              type="text"
              placeholder="Restaurant Address"
              value={formData.restaurantAddress}
              readOnly
              className="w-full mb-4 p-2 border rounded"
            />
          </>
        )}
        <label htmlFor='profile-role' className="block mb-1">
          Account Role
        </label>
        <input
          id="profile-role"
          type="text"
          value={formData.role === 'restaurant' ? 'Restaurant' : 'Customer'}
          readOnly
          className="w-full mb-4 p-2 border rounded"
        />
        <div className="mt-6 pt-4 border-t">
          {deleteError && (
            <p role="alert" className="text-red-600 mb-3">
              {deleteError}
            </p>
          )}

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full bg-red-600 text-white p-2 rounded disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
