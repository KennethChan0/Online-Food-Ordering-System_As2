import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { Navigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth(); // Access user token from context
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    restaurantAddress: '',
    role: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

        if (active){
        setFormData({
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone || '',
          restaurantAddress: response.data.restaurantAddress || '',
          role: response.data.role || '',
        });
      }
      } catch (error) {
        if (active){
        setError(error.response?.data?.message||'Failed to fetch profile. Please try again.');
        }
      } finally {
        if (active){
        setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      active = false;
    }
  }, [token]);

  if (!token){
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
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <label htmlFor='profile-email' className="block mb-1">
          Email
        </label>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <label htmlFor='profile-phone' className="block mb-1">
          Phone
        </label>
        <input
          type="text"
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        {formData.role === 'restaurant' && (
          <>
            <label htmlFor='profile-restaurant-address' className="block mb-1">
              Restaurant Address
            </label>
            <input
              type="text"
              placeholder="Restaurant Address"
              value={formData.restaurantAddress}
              onChange={(e) => setFormData({ ...formData, restaurantAddress: e.target.value })}
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
          value={formData.role === 'restaurant'? 'Restaurant' : 'Customer'}
          readOnly
          className="w-full mb-4 p-2 border rounded"
        />
      </div>
    </div>
  );
};

export default Profile;
