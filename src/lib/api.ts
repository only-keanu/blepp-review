const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const ACCESS_TOKEN_KEY = 'blepp_access_token';
export const REFRESH_TOKEN_KEY = 'blepp_refresh_token';

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

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

async function refreshAuthTokens() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    return false;
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${refreshToken}`
    }
  });

  if (!response.ok) {
    clearTokens();
    return false;
  }

  const auth = await response.json() as AuthResponse;
  setTokens(auth.accessToken, auth.refreshToken);
  return true;
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

  if (response.status === 401 && !path.startsWith('/api/auth/')) {
    const refreshed = await refreshAuthTokens();
    if (refreshed) {
      response = await sendRequest(path, options);
    }
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
