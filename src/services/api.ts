import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { API_CONFIG, getAuthHeader } from '../config/api';

const api: AxiosInstance = axios.create({
  ...API_CONFIG,
  baseURL: API_CONFIG.baseURL || 'http://localhost:3000',
  timeout: 10000,
});

// Interceptor para añadir el token de autenticación
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const headers = getAuthHeader();
  const axiosHeaders = new AxiosHeaders();
  axiosHeaders.setContentType('application/json');
  if (headers.Authorization) {
    axiosHeaders.setAuthorization(headers.Authorization);
  }
  config.headers = axiosHeaders;
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
