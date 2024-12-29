import axios from 'axios';
import { API_CONFIG, getAuthHeader } from '../config/api';

const api = axios.create(API_CONFIG);

// Interceptor para añadir el token de autenticación
api.interceptors.request.use((config) => {
  const authHeaders = getAuthHeader();
  config.headers = {
    ...config.headers,
    ...authHeaders,
  };
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Manejar error de autenticación
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
