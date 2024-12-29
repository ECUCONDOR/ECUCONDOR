import axios from 'axios';
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});
// Interceptor para agregar el token a las peticiones
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth-storage');
    if (token) {
        const parsedToken = JSON.parse(token);
        if (parsedToken.state.token) {
            config.headers.Authorization = `Bearer ${parsedToken.state.token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
// Interceptor para manejar errores de autenticación
api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});
export default api;
