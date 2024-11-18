import { useState, useCallback, useEffect } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types/auth';
import { authService } from '../services/api/authService';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(() => {
        const currentUser = authService.getCurrentUser();
        return currentUser?.user || null;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser.user);
        }
    }, []);

    const login = useCallback(async (credentials: LoginRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authService.login(credentials);
            setUser(response.user);
            return response;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during login');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (userData: RegisterRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const newUser = await authService.register(userData);
            return newUser;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during registration');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
    }, []);

    const isAuthenticated = Boolean(user && authService.getToken());

    return {
        user,
        login,
        logout,
        register,
        isLoading,
        error,
        isAuthenticated
    };
};
