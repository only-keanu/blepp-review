import {
  createContext,
  createElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { User } from '../types';
import {
  ApiRequestError,
  AUTH_EXPIRED_EVENT,
  apiFetch,
  clearTokens,
  getAccessToken,
  isAuthFailureStatus,
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
  const profileRefreshRef = useRef<Promise<void> | null>(null);

  const loadProfile = useCallback(async () => {
    if (profileRefreshRef.current) {
      return profileRefreshRef.current;
    }

    profileRefreshRef.current = (async () => {
      const token = getAccessToken();
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const profile = await apiFetch<User>('/api/me');
        setUser(profile);
      } catch (error) {
        if (
          error instanceof ApiRequestError &&
          isAuthFailureStatus(error.status) &&
          !error.transientAuthRefreshFailure
        ) {
          clearTokens();
          setUser(null);
        } else if (!getAccessToken()) {
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    })().finally(() => {
      profileRefreshRef.current = null;
    });

    return profileRefreshRef.current;
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      setIsLoading(false);
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
  }, []);

  useEffect(() => {
    const refreshProfileOnActiveTab = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }
      if (getAccessToken()) {
        void loadProfile();
      }
    };

    window.addEventListener('focus', refreshProfileOnActiveTab);
    document.addEventListener('visibilitychange', refreshProfileOnActiveTab);
    return () => {
      window.removeEventListener('focus', refreshProfileOnActiveTab);
      document.removeEventListener('visibilitychange', refreshProfileOnActiveTab);
    };
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
