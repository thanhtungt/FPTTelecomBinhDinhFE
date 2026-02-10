import api from './client';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../types/category';

export const CategoryAPI = {
  // Public endpoint - active categories only
  getAll: async (): Promise<Category[]> => {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },
  
  // Admin endpoint - all categories
  getAllCategories: async (): Promise<Category[]> => {
    const { data } = await api.get<Category[]>('/categories/all');
    return data;
  },
  
  getById: async (id: number): Promise<Category> => {
    const { data } = await api.get<Category>(`/categories/${id}`);
    return data;
  },
  
  getBySlug: async (slug: string): Promise<Category> => {
    const { data } = await api.get<Category>(`/categories/slug/${slug}`);
    return data;
  },
  
  create: async (dto: CreateCategoryDto): Promise<Category> => {
    const { data } = await api.post<Category>('/categories', dto);
    return data;
  },
  
  update: async (id: number, dto: UpdateCategoryDto): Promise<Category> => {
    const { data } = await api.put<Category>(`/categories/${id}`, dto);
    return data;
  },
  
  remove: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
  
  toggleActive: async (id: number): Promise<Category> => {
    const { data } = await api.patch<Category>(`/categories/${id}/toggle-active`);
    return data;
  }
};
