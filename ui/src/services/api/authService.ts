import axiosInstance from './axiosConfig';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../../types/auth';

const API_URL = '/api/auth';

class AuthService {
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        try {
            console.log('AuthService: Attempting login with:', credentials.username);
            const response = await axiosInstance.post<LoginResponse>(`${API_URL}/login`, credentials);
            console.log('AuthService: Login response received');
            
            if (response.data && response.data.token) {
                const userData = {
                    ...response.data.user,
                    token: response.data.token
                };
                
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(userData));
                console.log('AuthService: User data stored in localStorage');
                
                return response.data;
            }
            
            throw new Error('Login failed: Invalid response format');
        } catch (error) {
            console.error('AuthService: Login error:', error);
            this.logout();
            throw error;
        }
    }

    async register(userData: RegisterRequest): Promise<User> {
        try {
            console.log('AuthService: Attempting registration');
            const response = await axiosInstance.post<User>(`${API_URL}/register`, userData);
            console.log('AuthService: Registration successful');
            return response.data;
        } catch (error) {
            console.error('AuthService: Registration error:', error);
            if (error instanceof Error) {
                throw new Error(`Registration failed: ${error.message}`);
            }
            throw new Error('Registration failed');
        }
    }

    logout(): void {
        console.log('AuthService: Logging out');
        localStorage.removeItem('user');
        delete axiosInstance.defaults.headers.common['Authorization'];
    }

    getCurrentUser(): LoginResponse | null {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                console.log('AuthService: No user found in storage');
                return null;
            }
            return JSON.parse(userStr);
        } catch (error) {
            console.error('AuthService: Error getting current user:', error);
            return null;
        }
    }
}

export const authService = new AuthService();
