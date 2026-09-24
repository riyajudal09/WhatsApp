import axios from 'axios';

const apiUrl =
  `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api`;

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  timeout: 75000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;