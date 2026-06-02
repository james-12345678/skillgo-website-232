export const API_BASE_URL = 'https://skillgo.africa/staging';

export function isAuthExpired(response: Response): boolean {
  return response.status === 401;
}

export function apiUrl(path: string): string {
  const clean = path.replace(/^\/+/, '');
  return `${API_BASE_URL}/${clean}`;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const fullUrl = apiUrl(path);

  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  const token = localStorage.getItem('auth_token');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  return fetch(fullUrl, { ...options, headers });
}
