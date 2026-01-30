import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthAPI } from '../api/auth';
import { AUTH_STORAGE_KEY } from '../api/client';
import type { AuthResponse, DecodedToken, LoginPayload, RegisterPayload } from '../types/auth';

interface AuthContextValue {
  user: AuthResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const loadStoredAuth = (): AuthResponse | null => {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed: AuthResponse = JSON.parse(raw);
    if (!parsed.token) return null;
    const isExpired = hasTokenExpired(parsed.token);
    if (isExpired) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch (_err) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

const persistAuth = (auth: AuthResponse | null) => {
  if (typeof window === 'undefined') return;

  if (!auth) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
};

const hasTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (!decoded.exp) return false;
    return decoded.exp * 1000 < Date.now();
  } catch (_error) {
    return false;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthResponse | null>(() => loadStoredAuth());

  useEffect(() => {
    persistAuth(auth);
  }, [auth]);

  const handleLogin = async (payload: LoginPayload) => {
    const response = await AuthAPI.login(payload);
    setAuth(response);
    return response;
  };

  const handleRegister = async (payload: RegisterPayload) => {
    const response = await AuthAPI.register(payload);
    setAuth(response);
    return response;
  };

  const handleLogout = () => {
    setAuth(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user: auth,
      token: auth?.token ?? null,
      isAuthenticated: Boolean(auth?.token),
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
