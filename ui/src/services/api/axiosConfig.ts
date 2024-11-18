import axios from 'axios';
import { authService } from './authService';

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://localhost:7240',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                if (userData.token) {
                    config.headers.Authorization = `Bearer ${userData.token}`;
                    console.log('Request:', {
                        url: config.url,
                        method: config.method,
                        baseURL: config.baseURL,
                        hasToken: true
                    });
                } else {
                    console.warn('No token found in user data');
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        } else {
            console.log('No user data found in localStorage');
            if (!config.url?.includes('/auth/')) {
                throw new Error('Authentication required');
            }
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
        console.log('Response:', {
            url: response.config.url,
            status: response.status,
            statusText: response.statusText
        });
        return response;
    },
    async (error) => {
        console.error('Response error:', {
            url: error.config?.url,
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message
        });

        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // Only handle unauthorized error if we're not already on an auth endpoint
                    if (!error.config.url?.includes('/auth/')) {
                        console.error('Authentication error - logging out');
                        authService.logout();
                        window.location.href = '/login';
                    }
                    break;
                case 403:
                    console.error('Authorization error - insufficient permissions');
                    break;
                case 404:
                    console.error('Resource not found');
                    break;
                default:
                    console.error('Server error:', error.response.status);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
