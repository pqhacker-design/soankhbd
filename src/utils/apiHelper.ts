// Helper functions for storing and retrieving user-provided Gemini API key per user account

const KEY_PREFIX = 'user_gemini_api_key_';
const ACTIVE_USER_ID_KEY = 'ai_planner_active_user_id';

export function getActiveUserId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(ACTIVE_USER_ID_KEY) || '';
}

export function setActiveUserId(userId: string): void {
  if (typeof window === 'undefined') return;
  if (userId) {
    localStorage.setItem(ACTIVE_USER_ID_KEY, userId);
  } else {
    localStorage.removeItem(ACTIVE_USER_ID_KEY);
  }
}

export function getUserApiKey(userId?: string): string {
  if (typeof window === 'undefined') return '';
  const targetId = userId || getActiveUserId();
  if (targetId) {
    const userKey = localStorage.getItem(`${KEY_PREFIX}${targetId}`);
    return userKey ? userKey.trim() : '';
  }
  const legacyKey = localStorage.getItem('user_gemini_api_key');
  return legacyKey ? legacyKey.trim() : '';
}

export function setUserApiKey(key: string, userId?: string): void {
  if (typeof window === 'undefined') return;
  const targetId = userId || getActiveUserId();
  const cleanKey = key.trim();

  if (targetId) {
    const storageKey = `${KEY_PREFIX}${targetId}`;
    if (!cleanKey) {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, cleanKey);
    }
  } else {
    if (!cleanKey) {
      localStorage.removeItem('user_gemini_api_key');
    } else {
      localStorage.setItem('user_gemini_api_key', cleanKey);
    }
  }
}

export function clearUserApiKey(userId?: string): void {
  if (typeof window === 'undefined') return;
  const targetId = userId || getActiveUserId();
  if (targetId) {
    localStorage.removeItem(`${KEY_PREFIX}${targetId}`);
  }
  localStorage.removeItem('user_gemini_api_key');
}

export function getApiKeyHeaders(userId?: string): Record<string, string> {
  const userKey = getUserApiKey(userId);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (userKey) {
    headers['x-user-api-key'] = userKey;
  }
  return headers;
}

