import api from './client';
import type { Package } from '../types/package';

export const PackageAPI = {
  getAll: async (): Promise<Package[]> => {
    const { data } = await api.get<Package[]>('/packages');
    return data;
  },
  getById: async (id: number): Promise<Package> => {
    const { data } = await api.get<Package>(`/packages/${id}`);
    return data;
  }
};
