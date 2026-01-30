import api from './client';
import type {
  CreateRegistrationPayload,
  Registration,
  RegistrationStatus,
  UpdateRegistrationPayload
} from '../types/registration';

export const RegistrationAPI = {
  create: async (payload: CreateRegistrationPayload): Promise<Registration> => {
    const { data } = await api.post<Registration>('/registrations', payload);
    return data;
  },
  getById: async (id: number): Promise<Registration> => {
    const { data } = await api.get<Registration>(`/registrations/${id}`);
    return data;
  },
  getMine: async (): Promise<Registration[]> => {
    const { data } = await api.get<Registration[]>('/registrations/my');
    return data;
  },
  getAll: async (status?: RegistrationStatus): Promise<Registration[]> => {
    const { data } = await api.get<Registration[]>('/registrations', {
      params: status ? { status } : undefined
    });
    return data;
  },
  updateStatus: async (id: number, payload: UpdateRegistrationPayload): Promise<Registration> => {
    const { data } = await api.put<Registration>(`/registrations/${id}/status`, payload);
    return data;
  },
  assignStaff: async (id: number, staffId: number): Promise<Registration> => {
    const { data } = await api.put<Registration>(`/registrations/${id}/assign`, { StaffId: staffId });
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/registrations/${id}`);
  }
};
