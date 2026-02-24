import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'https://localhost:7086/api';
const AUTH_STORAGE_KEY = 'fpttelecom-auth';

// Match the actual stored structure (full AuthResponse)
interface StoredAuth {
  id: number;
  name: string;
  email?: string | null;
  phone: string;
  role: string;
  token: string;
}

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
        // Only remove if it's actually corrupted JSON
        // Don't remove on other errors
        if (_err instanceof SyntaxError) {
          window.localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    }
  }

  return config;
});

// Response interceptor - Handle errors including timeout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized — but NOT for auth endpoints (login/register)
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      
      if (!isAuthEndpoint) {
        // Only clear token and redirect for non-auth endpoints
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
export { AUTH_STORAGE_KEY };
