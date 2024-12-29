import axios from 'axios';

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
};

export const getAuthHeader = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth-storage');
    if (token) {
      const parsedToken = JSON.parse(token);
      if (parsedToken.state.token) {
        return { Authorization: `Bearer ${parsedToken.state.token}` };
      }
    }
  }
  return {};
};

const api = axios.create(API_CONFIG);

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const headers = getAuthHeader();
    if (headers.Authorization) {
      config.headers.Authorization = headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
