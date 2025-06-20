import axios from 'axios';


const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const instance = axios.create({
  baseURL,
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ✅ session expired
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      !window.location.pathname.includes('/login')
    ) {
      // delete from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Login again
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export const BASE_FILE_URL = baseURL.replace('/api', '');
export default instance;
