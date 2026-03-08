import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User } from '../types';
import { apiFetch, AUTH_NOTICE_EVENT, AUTH_NOTICE_KEY, clearTokens, getAccessToken, initAuth, setTokens } from '../lib/api';
import { AuthToast } from '../components/layout/AuthToast';

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
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      initAuth();
      const storedNotice = getStoredNotice();
      if (storedNotice) {
        setNotice(storedNotice);
      }
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

  useEffect(() => {
    if (!notice) {
      return;
    }
    const timeoutId = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  useEffect(() => {
    const handleNotice = (event: Event) => {
      const custom = event as CustomEvent<string>;
      const message = typeof custom.detail === 'string' ? custom.detail : 'Session expired. Please log in again.';
      setNotice(message);
      setUser(null);
      setIsLoading(false);
      if (!window.location.pathname.startsWith('/auth/')) {
        window.location.assign('/auth/login');
      }
    };
    window.addEventListener(AUTH_NOTICE_EVENT, handleNotice);
    return () => window.removeEventListener(AUTH_NOTICE_EVENT, handleNotice);
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

  return (
    <AuthContext.Provider value={value}>
      {children}
      {notice && <AuthToast message={notice} />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function getStoredNotice() {
  try {
    const message = sessionStorage.getItem(AUTH_NOTICE_KEY);
    if (message) {
      sessionStorage.removeItem(AUTH_NOTICE_KEY);
      return message;
    }
  } catch {
    return null;
  }
  return null;
}
