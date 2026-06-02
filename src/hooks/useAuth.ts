import {
  createContext,
  createElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { User } from '../types';
import {
  apiFetch,
  clearTokens,
  getAccessToken,
  logoutAuth,
  setTokens
} from '../lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Partial<User> & {password?: string;}) => Promise<void>;
  oauthLogin: (provider: 'google' | 'facebook', code: string, redirectUri: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

interface AuthResponse {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
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
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const login = useCallback(async (email: string, password: string) => {
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
  }, []);

  const register = useCallback(async (data: Partial<User> & {password?: string;}) => {
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
  }, []);

  const oauthLogin = useCallback(
    async (provider: 'google' | 'facebook', code: string, redirectUri: string) => {
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
    },
    []
  );

  const logout = useCallback(async () => {
    void logoutAuth();
    setUser(null);
    clearTokens();
  }, []);

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
    [isLoading, login, logout, oauthLogin, register, user]
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
