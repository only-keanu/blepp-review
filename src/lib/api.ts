const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const REQUEST_ID_HEADER = 'X-Request-Id';

export const ACCESS_TOKEN_KEY = 'blepp_access_token';
export const REFRESH_TOKEN_KEY = 'blepp_refresh_token';
export const AUTH_EXPIRED_EVENT = 'blepp_auth_expired';

type RefreshResult = 'refreshed' | 'expired' | 'failed';
const ACCESS_TOKEN_REFRESH_SKEW_SECONDS = 60;

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

function backendUnavailableError() {
  return new ApiRequestError(0, 'Cannot reach the backend. Make sure the API is running.');
}

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
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });
  } catch {
    return 'failed';
  }

  if (!response.ok) {
    if (response.status === 400 || response.status === 401 || response.status === 403) {
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

function decodeJwtPayload(token: string): { exp?: number } | null {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4 || 4)), '=');
    return JSON.parse(atob(padded)) as { exp?: number };
  } catch {
    return null;
  }
}

function accessTokenExpiresSoon(token: string) {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return true;
  }
  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSeconds + ACCESS_TOKEN_REFRESH_SKEW_SECONDS;
}

function shouldProactivelyRefresh(path: string) {
  if (path.startsWith('/api/auth/')) {
    return false;
  }
  const accessToken = getAccessToken();
  return !!accessToken && !!getRefreshToken() && accessTokenExpiresSoon(accessToken);
}

async function sendRequest(path: string, options: RequestInit = {}) {
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has(REQUEST_ID_HEADER)) {
    headers.set(REQUEST_ID_HEADER, createRequestId());
  }
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

function createRequestId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  let transientAuthRefreshFailure = false;
  if (shouldProactivelyRefresh(path)) {
    const refreshResult = await refreshAuthTokens();
    if (refreshResult === 'failed') {
      transientAuthRefreshFailure = true;
    }
  }

  let response: Response;
  try {
    response = await sendRequest(path, options);
  } catch {
    throw backendUnavailableError();
  }
  let retriedAfterRefresh = false;

  if (response.status === 401 && !path.startsWith('/api/auth/')) {
    const refreshResult = await refreshAuthTokens();
    if (refreshResult === 'refreshed') {
      retriedAfterRefresh = true;
      try {
        response = await sendRequest(path, options);
      } catch {
        throw backendUnavailableError();
      }
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
