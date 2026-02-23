import type { UserRole } from './auth';

export interface User {
  id: number;
  name: string;
  email?: string | null;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export interface CreateUserPayload {
  name: string;
  email?: string;
  phone: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  name: string;
  email?: string;
  phone: string;
  password?: string; // Optional - only update if provided
}

export interface UpdateUserRolePayload {
  role: UserRole;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UserStatistics {
  totalUsers: number;
  usersByRole: Record<UserRole, number>;
}
