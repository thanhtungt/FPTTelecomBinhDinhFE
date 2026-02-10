import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'https://localhost:7086/api';
const AUTH_STORAGE_KEY = 'fpttelecom-auth';

type StoredAuth = {
  token: string;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30s for large content (was 10s)
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add auth token if available
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

// Response interceptor - Handle errors including timeout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle timeout specifically for large content
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.error('[API] Request timeout - content too large or slow backend. Consider enabling compression on backend.');
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    
    return Promise.reject(error);
  }
);

export default api;
export { AUTH_STORAGE_KEY };
