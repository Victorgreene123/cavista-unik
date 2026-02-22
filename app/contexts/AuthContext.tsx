"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: 'INDIVIDUAL' | 'HOSPITAL_ADMIN' | 'DOCTOR';
  individualProfile?: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  };
  hospitalProfile?: {
    name: string;
    regNumber: string;
  };
  doctorProfile?: {
    firstName: string;
    lastName: string;
    specialization: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: string) => Promise<void>;
  register: (email: string, password: string, role: string, profileData: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, role: string, profileData: any) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role,
          ...profileData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: user !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

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
