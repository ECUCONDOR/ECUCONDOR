import axios from 'axios';
import { componentLoggers } from '@/lib/logger';

const { api: logger } = componentLoggers;

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    const requestId = crypto.randomUUID();
    config.headers['X-Request-ID'] = requestId;

    logger.info('API request started', {
      method: config.method?.toUpperCase(),
      url: config.url,
      requestId,
    });

    return config;
  },
  (error) => {
    logger.error('API request error', {
      error: error.message,
    }, error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    logger.info('API response received', {
      status: response.status,
      url: response.config.url,
      requestId: response.config.headers['X-Request-ID'],
    });
    return response;
  },
  (error) => {
    logger.error('API response error', {
      status: error.response?.status,
      url: error.config?.url,
      requestId: error.config?.headers['X-Request-ID'],
      error: error.message,
    }, error);
    return Promise.reject(error);
  }
);

export default api;
