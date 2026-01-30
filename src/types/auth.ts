export type UserRole = 'User' | 'Admin' | 'Staff';

export interface AuthResponse {
  id: number;
  name: string;
  email?: string | null;
  phone: string;
  role: UserRole | string;
  token: string;
}

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email?: string;
  phone: string;
  password: string;
}

export interface DecodedToken {
  exp: number;
  iat: number;
  role?: string;
  name?: string;
  phone?: string;
  [key: string]: unknown;
}
