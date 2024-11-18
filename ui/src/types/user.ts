import { UserRole } from './auth';

export interface User {
    userId: string;
    username: string;
    role: UserRole;
    token: string;
}

export interface AuthResponse {
    user: {
        userId: string;
        username: string;
        role: UserRole;
    };
    token: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterCredentials extends LoginCredentials {
    email: string;
    role?: UserRole;
}
