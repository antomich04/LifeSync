import { HttpErrorResponse } from '@angular/common/http';

type ErrorLanguage = 'en' | 'el';

const ERROR_TRANSLATIONS: Record<ErrorLanguage, Record<string, string>> = {
  en: {
    rateLimitTitle: 'Rate Limit Reached',
    connectionTitle: 'Connection Problem',
    rateLimitMessage: 'You have made too many requests. Please wait a minute and try again.',
    connectionMessage: 'The server could not be reached. Please check your connection and try again.',
  },
  el: {
    rateLimitTitle: 'Έφτασες το όριο αιτημάτων',
    connectionTitle: 'Πρόβλημα σύνδεσης',
    rateLimitMessage: 'Έκανες πάρα πολλά αιτήματα. Περίμενε ένα λεπτό και δοκίμασε ξανά.',
    connectionMessage: 'Δεν ήταν δυνατή η επικοινωνία με τον διακομιστή. Έλεγξε τη σύνδεσή σου και δοκίμασε ξανά.',
  },
};

function currentLanguage(): ErrorLanguage {
  return localStorage.getItem('lifesync.language') === 'el' ? 'el' : 'en';
}

function translateError(key: string): string {
  const language = currentLanguage();
  return ERROR_TRANSLATIONS[language][key] ?? ERROR_TRANSLATIONS.en[key] ?? key;
}

function extractBackendMessage(error: HttpErrorResponse): string | null {
  const body = error.error;

  if (typeof body === 'string') return body;
  if (!body || typeof body !== 'object') return null;

  const candidate = body['detail'] ?? body['error'] ?? body['message'];
  return typeof candidate === 'string' ? candidate : null;
}

export function getApiErrorTitle(error: unknown, fallback = 'Request Failed'): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 429) return translateError('rateLimitTitle');
    if (error.status === 0) return translateError('connectionTitle');
  }

  return fallback;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 429) {
      return translateError('rateLimitMessage');
    }

    if (error.status === 0) {
      return translateError('connectionMessage');
    }

    return extractBackendMessage(error) ?? fallback;
  }

  return fallback;
}
