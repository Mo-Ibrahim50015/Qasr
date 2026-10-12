'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiRequest } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await apiRequest<{ success: boolean; data: { user: User } }>('/auth/me');
      if (res.success && res.data.user) {
        setUser(res.data.user);
      }
    } catch {
      // Token expired or invalid
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('qasr_token');
      if (savedToken) {
        setToken(savedToken);
        refreshUser();
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  const login = (newToken: string, refreshToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('qasr_token', newToken);
      localStorage.setItem('qasr_refresh_token', refreshToken);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('qasr_token');
      localStorage.removeItem('qasr_refresh_token');
    }
  };

  // Restrict Admin dashboard strictly to the authorized admin email only
  const ADMIN_EMAILS = ['mohammedibrahim50015@gmail.com'];
  const ADMIN_PHONES = ['01098108123'];
  const isAdmin =
    user?.role === 'ADMIN' &&
    (ADMIN_EMAILS.includes(user?.email?.toLowerCase() || '') ||
      ADMIN_PHONES.includes(user?.phone?.replace(/[\s-]/g, '') || ''));

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        isLoading,
        login,
        logout,
        refreshUser,
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

