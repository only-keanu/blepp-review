const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const ACCESS_TOKEN_KEY = 'blepp_access_token';
export const REFRESH_TOKEN_KEY = 'blepp_refresh_token';
export const AUTH_EXPIRED_EVENT = 'blepp_auth_expired';

type RefreshResult = 'refreshed' | 'expired' | 'failed';

interface ApiRequestErrorOptions {
  transientAuthRefreshFailure?: boolean;
}

export class ApiRequestError extends Error {
  status: number;
  transientAuthRefreshFailure: boolean;

  constructor(status: number, message: string, options: ApiRequestErrorOptions = {}) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.transientAuthRefreshFailure = options.transientAuthRefreshFailure || false;
  }
}

export function isAuthFailureStatus(status: number) {
  return status === 401;
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken?: string, refreshToken?: string) {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function emitAuthExpired() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }
}

function expireAuth() {
  clearTokens();
  emitAuthExpired();
}

export async function logoutAuth() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return;
  }

  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshToken}`
      }
    });
  } catch {
    // Local logout should still complete if the network or API is unavailable.
  }
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

let refreshPromise: Promise<RefreshResult> | null = null;

async function requestTokenRefresh(): Promise<RefreshResult> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    expireAuth();
    return 'expired';
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshToken}`
      }
    });
  } catch {
    return 'failed';
  }

  if (!response.ok) {
    if (response.status === 400 || response.status === 401) {
      expireAuth();
      return 'expired';
    }
    return 'failed';
  }

  let auth: AuthResponse;
  try {
    auth = await response.json() as AuthResponse;
  } catch {
    return 'failed';
  }
  if (!auth.accessToken || !auth.refreshToken) {
    expireAuth();
    return 'expired';
  }
  setTokens(auth.accessToken, auth.refreshToken);
  return 'refreshed';
}

async function refreshAuthTokens(): Promise<RefreshResult> {
  if (!refreshPromise) {
    refreshPromise = requestTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function sendRequest(path: string, options: RequestInit = {}) {
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!headers.has('Content-Type') && options.body && !isFormData) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response = await sendRequest(path, options);
  let transientAuthRefreshFailure = false;
  let retriedAfterRefresh = false;

  if (response.status === 401 && !path.startsWith('/api/auth/')) {
    const refreshResult = await refreshAuthTokens();
    if (refreshResult === 'refreshed') {
      retriedAfterRefresh = true;
      response = await sendRequest(path, options);
    } else if (refreshResult === 'failed') {
      transientAuthRefreshFailure = true;
    }
  }

  if (retriedAfterRefresh && response.status === 401) {
    expireAuth();
  }

  if (!response.ok) {
    const text = await response.text();
    let message = text;
    if (text) {
      try {
        const errorBody = JSON.parse(text) as { message?: string };
        message = errorBody.message || text;
      } catch (error) {
        message = text;
      }
    }
    throw new ApiRequestError(
      response.status,
      message || `Request failed with status ${response.status}`,
      { transientAuthRefreshFailure }
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
