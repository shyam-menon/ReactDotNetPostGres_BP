import axiosInstance from './axiosConfig';
import { User, LoginRequest, LoginResponse, RegisterRequest } from '../../types/auth';

const API_URL = '/api/auth';

class AuthService {
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        try {
            console.log('Attempting login with:', credentials.username);
            const response = await axiosInstance.post<LoginResponse>(`${API_URL}/login`, credentials);
            console.log('Login response:', response.data);
            
            if (response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
                // Set default authorization header
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            }
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            if (error instanceof Error) {
                throw new Error(`Login failed: ${error.message}`);
            }
            throw new Error('Login failed');
        }
    }

    async register(userData: RegisterRequest): Promise<User> {
        try {
            const response = await axiosInstance.post<User>(`${API_URL}/register`, userData);
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            if (error instanceof Error) {
                throw new Error(`Registration failed: ${error.message}`);
            }
            throw new Error('Registration failed');
        }
    }

    logout(): void {
        localStorage.removeItem('user');
        delete axiosInstance.defaults.headers.common['Authorization'];
    }

    getCurrentUser(): LoginResponse | null {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                // Verify token exists
                if (!user.token) {
                    this.logout();
                    return null;
                }
                return user;
            }
            return null;
        } catch (error) {
            console.error('Error getting current user:', error);
            this.logout();
            return null;
        }
    }

    getToken(): string | null {
        const user = this.getCurrentUser();
        if (user?.token) {
            // Set default authorization header
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            return user.token;
        }
        return null;
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;

        try {
            // Check if token is expired
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp * 1000; // Convert to milliseconds
            if (Date.now() >= expiry) {
                this.logout();
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error checking token:', error);
            this.logout();
            return false;
        }
    }

    async getCurrentUserInfo(): Promise<User | null> {
        try {
            const token = this.getToken();
            if (!token) return null;

            const response = await axiosInstance.get<User>(`${API_URL}/current`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            this.logout();
            return null;
        }
    }
}

export const authService = new AuthService();
