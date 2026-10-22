import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://13.239.36.40:5001',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to API requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
