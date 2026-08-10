// Helper functions for storing and retrieving user-provided Gemini API key

const STORAGE_KEY = 'user_gemini_api_key';

export function getUserApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY) || '';
}

export function setUserApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (!key.trim()) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, key.trim());
  }
}

export function clearUserApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getApiKeyHeaders(): Record<string, string> {
  const userKey = getUserApiKey();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (userKey) {
    headers['x-user-api-key'] = userKey;
  }
  return headers;
}
