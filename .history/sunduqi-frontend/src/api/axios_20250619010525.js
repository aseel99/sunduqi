import axios from 'axios';

// Dynamically set base URL based on environment
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const instance = axios.create({
  baseURL,
  withCredentials: true
});

// Automatically attach token from localStorage if available
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Export base URL for accessing static files like uploads
export const BASE_FILE_URL = baseURL.replace('/api', '');

export default instance;
