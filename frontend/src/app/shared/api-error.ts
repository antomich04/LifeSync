import { HttpErrorResponse } from '@angular/common/http';

function extractBackendMessage(error: HttpErrorResponse): string | null {
  const body = error.error;

  if (typeof body === 'string') return body;
  if (!body || typeof body !== 'object') return null;

  const candidate = body['detail'] ?? body['error'] ?? body['message'];
  return typeof candidate === 'string' ? candidate : null;
}

export function getApiErrorTitle(error: unknown, fallback = 'Request Failed'): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 429) return 'Rate Limit Reached';
    if (error.status === 0) return 'Connection Problem';
  }

  return fallback;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 429) {
      return 'You have made too many requests. Please wait a minute and try again.';
    }

    if (error.status === 0) {
      return 'The server could not be reached. Please check your connection and try again.';
    }

    return extractBackendMessage(error) ?? fallback;
  }

  return fallback;
}
