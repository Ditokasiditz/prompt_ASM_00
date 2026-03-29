// Central API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper to get the stored JWT token (safe for SSR)
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

// Authenticated fetch wrapper — automatically adds Authorization header
export const apiFetch = (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
};
