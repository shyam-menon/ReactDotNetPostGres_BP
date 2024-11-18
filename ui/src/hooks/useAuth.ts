import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api/authService';
import { User, LoginCredentials, RegisterCredentials } from '../types/user';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean; // Add this property
  error: string | null; // Add this property
  register: (credentials: RegisterCredentials) => Promise<void>; // Add this property
}

export function useAuth(): AuthContextType {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const login = useCallback(async (credentials: LoginCredentials) => {
        try {
            setIsLoading(true);
            const response = await authService.login(credentials);
            const userData: User = {
                userId: response.user.userId,
                username: response.user.username,
                role: response.user.role,
                token: response.token
            };
            setUser(userData);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            setError('Login failed. Please try again.');
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
        navigate('/login');
    }, [navigate]);

    const register = async (credentials: RegisterCredentials) => {
        // Your registration logic here
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                if (userData && userData.token) {
                    setUser(userData);
                } else {
                    console.warn('Invalid user data in storage');
                    logout();
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                logout();
            }
        }
    }, [logout]);

    const isAuthenticated = Boolean(user?.token);

    return {
        user,
        login,
        logout,
        isAuthenticated,
        isLoading, // Return this property
        error, // Return this property
        register, // Return this property
    };
}
