import axios from 'axios';
import { authService } from './authService';

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: 'https://localhost:7240',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true // Important for CORS with credentials
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Request URL:', config.url);
            console.log('Authorization header:', config.headers.Authorization);
        } else {
            console.log('No token found');
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('Response received:', response.status);
        return response;
    },
    async (error) => {
        console.error('Response error:', error);
        if (error.response?.status === 401) {
            console.log('Unauthorized error:', error.response);
            authService.logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
