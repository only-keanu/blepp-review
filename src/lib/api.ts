const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const ACCESS_TOKEN_KEY = 'blepp_access_token';
export const REFRESH_TOKEN_KEY = 'blepp_refresh_token';
const REFRESH_ENDPOINT = '/api/auth/refresh';
const REFRESH_SKEW_MS = 60_000;
const REFRESH_EARLY_MS = 2 * 60_000;

let refreshTimer: number | null = null;
let refreshInFlight: Promise<string | null> | null = null;

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
  scheduleRefresh();
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  clearRefreshTimer();
}

export function initAuth() {
  scheduleRefresh();
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  await ensureFreshAccessToken();
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!headers.has('Content-Type') && options.body && !isFormData) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 401 && path !== REFRESH_ENDPOINT) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiFetch<T>(path, options);
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

function clearRefreshTimer() {
  if (refreshTimer !== null) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

function scheduleRefresh() {
  clearRefreshTimer();
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  if (!accessToken || !refreshToken) {
    return;
  }
  const expiryMs = getTokenExpiryMs(accessToken);
  if (!expiryMs) {
    return;
  }
  const delayMs = Math.max(0, expiryMs - Date.now() - REFRESH_SKEW_MS);
  refreshTimer = window.setTimeout(() => {
    refreshAccessToken().catch(() => {
      // Swallow refresh errors; consumers will handle auth failures.
    });
  }, delayMs);
}

function getTokenExpiryMs(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') {
    return null;
  }
  return payload.exp * 1000;
}

function decodeJwtPayload(token: string): {exp?: number} | null {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const json = atob(padded);
    return JSON.parse(json) as {exp?: number};
  } catch {
    return null;
  }
}

async function ensureFreshAccessToken() {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  if (!accessToken || !refreshToken) {
    return;
  }
  const expiryMs = getTokenExpiryMs(accessToken);
  if (!expiryMs) {
    return;
  }
  const shouldRefresh = Date.now() + REFRESH_EARLY_MS >= expiryMs;
  if (shouldRefresh) {
    await refreshAccessToken();
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }
  if (refreshInFlight) {
    return refreshInFlight;
  }
  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${REFRESH_ENDPOINT}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshToken}`
        }
      });
      if (!response.ok) {
        clearTokens();
        return null;
      }
      const auth = (await response.json()) as {
        accessToken: string;
        refreshToken: string;
      };
      setTokens(auth.accessToken, auth.refreshToken);
      return auth.accessToken;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}
