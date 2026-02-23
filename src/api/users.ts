import api from './client';
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  UpdateUserRolePayload,
  ChangePasswordPayload,
  UserStatistics
} from '../types/user';

export const UsersAPI = {
  /**
   * Get all users (Admin only)
   * @param role Optional role filter
   */
  getAll: async (role?: string): Promise<User[]> => {
    const { data } = await api.get<User[]>('/users', {
      params: role ? { role } : undefined
    });
    return data;
  },

  /**
   * Get user by ID (Admin or self)
   */
  getById: async (id: number): Promise<User> => {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  /**
   * Get current user profile
   */
  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/users/me');
    return data;
  },

  /**
   * Create new user (Admin only)
   */
  create: async (payload: CreateUserPayload): Promise<User> => {
    const { data } = await api.post<User>('/users', payload);
    return data;
  },

  /**
   * Update user (Admin or self)
   */
  update: async (id: number, payload: UpdateUserPayload): Promise<User> => {
    const { data } = await api.put<User>(`/users/${id}`, payload);
    return data;
  },

  /**
   * Update user role (Admin only)
   */
  updateRole: async (id: number, payload: UpdateUserRolePayload): Promise<User> => {
    const { data } = await api.put<User>(`/users/${id}/role`, payload);
    return data;
  },

  /**
   * Delete user (Admin only)
   */
  remove: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  /**
   * Change password (self)
   */
  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await api.post('/users/change-password', payload);
  },

  /**
   * Get user statistics (Admin only)
   */
  getStatistics: async (): Promise<UserStatistics> => {
    const { data } = await api.get<UserStatistics>('/users/statistics');
    return data;
  }
};
