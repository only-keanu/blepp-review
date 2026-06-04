import { ApiRequestError } from './api';

export function apiLoaderErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiRequestError) {
    if (error.status === 0) {
      return 'Cannot reach the backend. Make sure the API is running.';
    }
    if (error.status === 401) {
      return error.transientAuthRefreshFailure
        ? 'Could not refresh your session because the backend is unavailable. Try again in a moment.'
        : 'Your session has expired. Please sign in again.';
    }
    if (error.status === 403) {
      return 'Your study access has expired. Visit Access and payment to continue.';
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
