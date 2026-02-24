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
    console.log('[API] 🔑 Checking localStorage for token...', raw ? 'Found' : 'Not found');
    if (raw) {
      try {
        const parsed: StoredAuth = JSON.parse(raw);
        console.log('[API] 📦 Parsed auth data:', { hasToken: !!parsed.token, role: parsed.role });
        if (parsed.token) {
          const tokenPreview = `${parsed.token.substring(0, 20)}...${parsed.token.substring(parsed.token.length - 20)}`;
          config.headers.Authorization = `Bearer ${parsed.token}`;
          console.log('[API] ✅ Added Authorization header to request:', config.url);
          console.log('[API] 🎟️ Token preview:', tokenPreview);
          console.log('[API] 📋 Full request headers:', config.headers);
        } else {
          console.warn('[API] ⚠️ Token missing in stored auth data!');
        }
      } catch (_err) {
        console.error('[API] ❌ Failed to parse stored auth:', _err);
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
    
    // Handle 401 Unauthorized — but NOT for auth endpoints (login/register)
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      console.error('[API] ❌ 401 Unauthorized Response:', {
        url: error.config?.url,
        method: error.config?.method,
        hasAuthHeader: !!error.config?.headers?.Authorization,
        responseData: error.response?.data,
        responseHeaders: error.response?.headers
      });
      
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      
      if (!isAuthEndpoint) {
        // Only clear token and redirect for non-auth endpoints
        console.warn('[API] 🚪 Clearing token and redirecting to login...');
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        if (!window.location.pathname.includes('/login')) {
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
export { AUTH_STORAGE_KEY };
