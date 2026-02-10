import api from './client';
import type { Package, CreatePackageDto, UpdatePackageDto } from '../types/package';

export const PackageAPI = {
  // Public endpoint - active packages only
  getAll: async (categoryId?: number): Promise<Package[]> => {
    const params = categoryId ? { categoryId } : {};
    const { data } = await api.get<Package[]>('/packages', { params });
    return data;
  },
  
  // Admin endpoint - all packages including inactive
  getAllPackages: async (categoryId?: number): Promise<Package[]> => {
    const params = categoryId ? { categoryId } : {};
    const { data } = await api.get<Package[]>('/packages/all', { params });
    return data;
  },
  
  getById: async (id: number): Promise<Package> => {
    const { data } = await api.get<Package>(`/packages/${id}`);
    return data;
  },
  
  create: async (dto: CreatePackageDto): Promise<Package> => {
    const { data } = await api.post<Package>('/packages', dto);
    return data;
  },
  
  update: async (id: number, dto: UpdatePackageDto): Promise<Package> => {
    const { data } = await api.put<Package>(`/packages/${id}`, dto);
    return data;
  },
  
  remove: async (id: number): Promise<void> => {
    await api.delete(`/packages/${id}`);
  },
  
  toggleActive: async (id: number): Promise<Package> => {
    const { data } = await api.patch<Package>(`/packages/${id}/toggle-active`);
    return data;
  }
};
