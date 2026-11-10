const configuredBaseUrl = import.meta.env?.VITE_API_BASE_URL ?? '';

export const API_BASE_URL = String(configuredBaseUrl).trim().replace(/\/+$/, '');

export function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
