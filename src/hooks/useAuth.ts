import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  register: (data: Partial<User>) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Mock user data
const MOCK_USER: User = {
  id: '1',
  email: 'student@example.com',
  fullName: 'Maria Santos',
  targetExamDate: '2024-08-15',
  dailyStudyHours: 3,
  avatarUrl:
  'https://ui-avatars.com/api/?name=Maria+Santos&background=0D9488&color=fff'
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage on mount
    const storedUser = localStorage.getItem('blepp_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from local storage');
        localStorage.removeItem('blepp_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For demo purposes, we accept any email, but in a real app we'd validate
    // We'll just use the mock user but update the email if provided
    const userToLogin = { ...MOCK_USER, email };

    setUser(userToLogin);
    localStorage.setItem('blepp_user', JSON.stringify(userToLogin));
    setIsLoading(false);
  };

  const register = async (data: Partial<User>) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: data.email || '',
      fullName: data.fullName || '',
      targetExamDate: data.targetExamDate || '',
      dailyStudyHours: data.dailyStudyHours || 2,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName || 'User')}&background=0D9488&color=fff`
    };

    setUser(newUser);
    localStorage.setItem('blepp_user', JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('blepp_user');
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