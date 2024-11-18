export interface User {
    userId: string;
    username: string;
    role: UserRole;
}

export enum UserRole {
    Admin = 'Admin',
    ProjectManager = 'ProjectManager',
    TeamLead = 'TeamLead'
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
    confirmPassword: string;
    email: string; // Add this property
}
