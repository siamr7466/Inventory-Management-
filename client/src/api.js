import axios from 'axios';

// Creating axios instance with hardcoded production URL to avoid environment variable issues
const api = axios.create({
    baseURL: 'https://bmds.bd/api',
});

// Interceptor to attach token from localStorage for every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;