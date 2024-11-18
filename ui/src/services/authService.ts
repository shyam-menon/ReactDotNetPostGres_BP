import axios from 'axios';

const API_URL = 'https://localhost:7240/api';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    userId: string;
    username: string;
}

class AuthService {
    async login(username: string, password: string): Promise<LoginResponse> {
        const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
            username,
            password
        });
        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    }

    logout(): void {
        localStorage.removeItem('user');
    }

    getCurrentUser(): LoginResponse | null {
        const userStr = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    }

    getToken(): string | null {
        const user = this.getCurrentUser();
        return user?.token || null;
    }

    isAuthenticated(): boolean {
        return this.getToken() !== null;
    }
}

export default new AuthService();
