
import axios from 'axios';

// Axios instance: base URL + automatic token injection
// Why a custom instance? So we set baseURL and auth header ONCE,
// not in every single API call throughout the app.
const api = axios.create({
  baseURL: '/api', // Vite proxy forwards /api → http://localhost:5000/api
  headers: { 'Content-Type': 'application/json' },
});

// REQUEST INTERCEPTOR: Before every request, grab the JWT from localStorage
// and attach it as a Bearer token. If there's no token, the request goes through
// unauthenticated — protected routes will return 401.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE INTERCEPTOR: If any request returns 401 (unauthorized),
// clear the stored token and redirect to login.
// This handles token expiry automatically — no manual checks needed per page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
