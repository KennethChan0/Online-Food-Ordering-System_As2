import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Profile = () => {
  const { user, logout } = useAuth(); // Access user token from context
  const { clearCart } = useCart();
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
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [message, setMessage] = useState('');

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
    if (deleting || saving) return;

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
      clearCart();
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

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({ ...formData, [name]: value });
    setSaveError('');
    setMessage('');
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (saving || deleting) return;

    setSaveError('');
    setMessage('');

    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const digits = phone.replace(/\D/g, '');
    const restaurantAddress = formData.restaurantAddress.trim();

    if (!name || name.length > 80) {
      setSaveError('Name must contain 1 to 80 characters');
      return;
    }

    if (
      !/^\+?[0-9 ()-]+$/.test(phone) ||
      phone.length > 25 ||
      digits.length < 7 ||
      digits.length > 15
    ) {
      setSaveError('Please enter a valid phone number');
      return;
    }

    if (
      formData.role === 'restaurant' &&
      (!restaurantAddress || restaurantAddress.length > 300)
    ) {
      setSaveError('Restaurant address must contain 1 to 300 characters');
      return;
    }

    const updates = { name, phone };

    if (formData.role === 'restaurant') {
      updates.restaurantAddress = restaurantAddress;
    }

    setSaving(true);

    try {
      const response = await axiosInstance.put('/api/auth/profile', updates, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFormData({
        ...response.data.profile,
        restaurantAddress: response.data.profile.restaurantAddress || '',
      });

      setMessage(response.data.message);
    } catch (error) {
      setSaveError(
        error.response?.data?.message ||
        'Failed to update profile. Please try again.'
      );
    } finally {
      setSaving(false);
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
      <form onSubmit={handleSave} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {formData.role === 'restaurant' ? 'Restaurant Profile' : 'Your Profile'}
        </h1>
        {saveError && (
          <p role="alert" className="text-red-600 mb-4">
            {saveError}
          </p>
        )}
        {message && (
          <p role="status" className="text-green-600 mb-4">
            {message}
          </p>
        )}
        <label htmlFor='profile-name' className="block mb-1">
          {formData.role === 'restaurant' ? 'Restaurant Name' : 'Username'}
        </label>
        <input
          id="profile-name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          maxLength={80}
          disabled={saving || deleting}
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
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          required
          maxLength={25}
          disabled={saving || deleting}
          className="w-full mb-4 p-2 border rounded"
        />
        {formData.role === 'restaurant' && (
          <>
            <label htmlFor='profile-restaurant-address' className="block mb-1">
              Restaurant Address
            </label>
            <input
              id="profile-restaurant-address"
              name="restaurantAddress"
              type="text"
              value={formData.restaurantAddress}
              onChange={handleChange}
              required
              maxLength={300}
              disabled={saving || deleting}
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
            type="submit"
            disabled={saving || deleting}
            className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || saving}
            className="w-full bg-red-600 text-white p-2 rounded disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
