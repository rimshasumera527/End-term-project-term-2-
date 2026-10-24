import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5102/api',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ts_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const message = err.response?.data?.error?.message || 'Network error — is the backend running?';
    if (status === 401 && !err.config.url.includes('/auth/')) {
      localStorage.removeItem('ts_token');
      localStorage.removeItem('ts_user');
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    return Promise.reject(new Error(message));
  }
);

export default client;
