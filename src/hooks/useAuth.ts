import { useState, useEffect } from 'react';
import { User } from '../types';
import {
  apiFetch,
  clearTokens,
  getAccessToken,
  setTokens } from
'../lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Partial<User> & {password?: string;}) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface AuthResponse {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await apiFetch<User>('/api/me');
        setUser(profile);
      } catch (e) {
        clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const auth = await apiFetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setTokens(auth.accessToken, auth.refreshToken);
      const profile = await apiFetch<User>('/api/me');
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: Partial<User> & {password?: string;}) => {
    setIsLoading(true);
    try {
      const auth = await apiFetch<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          targetExamDate: data.targetExamDate,
          dailyStudyHours: data.dailyStudyHours
        })
      });
      setTokens(auth.accessToken, auth.refreshToken);
      const profile = await apiFetch<User>('/api/me');
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    clearTokens();
  };

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };
}
