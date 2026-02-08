import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User } from '../types';
import { apiFetch, clearTokens, getAccessToken, initAuth, setTokens } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Partial<User> & {password?: string;}) => Promise<void>;
  oauthLogin: (provider: 'google' | 'facebook', code: string, redirectUri: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface AuthResponse {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      initAuth();
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await apiFetch<User>('/api/me');
        setUser(profile);
      } catch {
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

  const oauthLogin = async (provider: 'google' | 'facebook', code: string, redirectUri: string) => {
    setIsLoading(true);
    try {
      const auth = await apiFetch<AuthResponse>(`/api/auth/oauth/${provider}`, {
        method: 'POST',
        body: JSON.stringify({ code, redirectUri })
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

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      register,
      oauthLogin,
      logout,
      isAuthenticated: !!user
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
