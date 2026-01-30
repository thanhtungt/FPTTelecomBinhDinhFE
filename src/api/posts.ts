import api from './client';
import type { Post, PostPayload } from '../types/post';

export const PostAPI = {
  getAll: async (category?: string): Promise<Post[]> => {
    const { data } = await api.get<Post[]>('/posts', {
      params: category ? { category } : undefined
    });
    return data;
  },
  getBySlug: async (slug: string): Promise<Post> => {
    const { data } = await api.get<Post>(`/posts/slug/${slug}`);
    return data;
  },
  getById: async (id: number): Promise<Post> => {
    const { data } = await api.get<Post>(`/posts/${id}`);
    return data;
  },
  create: async (payload: PostPayload): Promise<Post> => {
    const { data } = await api.post<Post>('/posts', payload);
    return data;
  },
  update: async (id: number, payload: PostPayload): Promise<Post> => {
    const { data } = await api.put<Post>(`/posts/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/posts/${id}`);
  }
};
