"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Define user types and interface
export type UserType = 'individual' | 'hospital';

export interface User {
    id: string;
    name: string;
    email: string;
    type: UserType;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string, type: UserType) => Promise<void>;
    register: (email: string, password: string, name: string, type: UserType) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Check for existing session on mount
    useEffect(() => {
        const checkAuth = () => {
            try {
                const storedUser = localStorage.getItem('cavista_user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Failed to parse stored user", error);
                localStorage.removeItem('cavista_user');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string, type: UserType) => {
        setIsLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock authentication logic
        // In a real app, this would hit an API endpoint
        if (password === 'password' || password.length >= 6) { // Simple validation for demo
            
            // Create mock user
            const newUser: User = {
                id: Math.random().toString(36).substr(2, 9),
                name: type === 'hospital' ? 'General Hospital' : 'John Doe',
                email,
                type,
                role: type === 'hospital' ? 'admin' : 'patient'
            };

            setUser(newUser);
            localStorage.setItem('cavista_user', JSON.stringify(newUser));
            
            // Redirect based on user type
            if (type === 'hospital') {
                router.push('/hospital/dashboard');
            } else {
                router.push('/individual');
            }

            return;
        }

        setIsLoading(false);
        throw new Error('Invalid credentials');
    };

    const register = async (email: string, password: string, name: string, type: UserType) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            email,
            type,
            role: type === 'hospital' ? 'admin' : 'patient'
        };

        setUser(newUser);
        localStorage.setItem('cavista_user', JSON.stringify(newUser));

        if (type === 'hospital') {
            router.push('/hospital/dashboard');
        } else {
            router.push('/individual');
        }
        
        setIsLoading(false);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('cavista_user');
        router.push('/auth/login');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
