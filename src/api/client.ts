import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'https://localhost:7086/api';
const AUTH_STORAGE_KEY = 'fpttelecom-auth';

type StoredAuth = {
  token: string;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      try {
        const parsed: StoredAuth = JSON.parse(raw);
        if (parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (_err) {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }

  return config;
});

export default api;
export { AUTH_STORAGE_KEY };
