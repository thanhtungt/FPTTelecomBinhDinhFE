import api from './client';
import type { JobPosting, CreateJobPostingPayload, UpdateJobPostingPayload } from '../types/jobPosting';

export const JobPostingAPI = {
  getAll: async (status?: string): Promise<JobPosting[]> => {
    const { data } = await api.get<JobPosting[]>('/JobPostings', {
      params: status ? { status } : undefined
    });
    return data;
  },
  
  getActive: async (): Promise<JobPosting[]> => {
    const { data } = await api.get<JobPosting[]>('/JobPostings/active');
    return data;
  },
  
  getById: async (id: number): Promise<JobPosting> => {
    const { data } = await api.get<JobPosting>(`/JobPostings/${id}`);
    return data;
  },
  
  create: async (payload: CreateJobPostingPayload): Promise<JobPosting> => {
    const { data } = await api.post<JobPosting>('/JobPostings', payload);
    return data;
  },
  
  update: async (id: number, payload: UpdateJobPostingPayload): Promise<JobPosting> => {
    const { data } = await api.put<JobPosting>(`/JobPostings/${id}`, payload);
    return data;
  },
  
  updateStatus: async (id: number, status: string): Promise<JobPosting> => {
    const { data } = await api.put<JobPosting>(`/JobPostings/${id}/status`, { status });
    return data;
  },
  
  remove: async (id: number): Promise<void> => {
    await api.delete(`/JobPostings/${id}`);
  }
};
