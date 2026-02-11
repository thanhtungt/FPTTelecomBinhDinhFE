import api from './client';
import type { JobApplication, CreateJobApplicationPayload, UpdateJobApplicationStatusPayload } from '../types/jobApplication';

export const JobApplicationAPI = {
  create: async (payload: CreateJobApplicationPayload): Promise<JobApplication> => {
    const { data } = await api.post<JobApplication>('/JobApplications', payload);
    return data;
  },
  
  getAll: async (status?: string): Promise<JobApplication[]> => {
    const { data } = await api.get<JobApplication[]>('/JobApplications', {
      params: status ? { status } : undefined
    });
    return data;
  },
  
  getByJobPosting: async (jobPostingId: number): Promise<JobApplication[]> => {
    const { data } = await api.get<JobApplication[]>(`/JobApplications/by-job/${jobPostingId}`);
    return data;
  },
  
  getById: async (id: number): Promise<JobApplication> => {
    const { data } = await api.get<JobApplication>(`/JobApplications/${id}`);
    return data;
  },
  
  updateStatus: async (id: number, payload: UpdateJobApplicationStatusPayload): Promise<JobApplication> => {
    const { data } = await api.put<JobApplication>(`/JobApplications/${id}/status`, payload);
    return data;
  },
  
  remove: async (id: number): Promise<void> => {
    await api.delete(`/JobApplications/${id}`);
  }
};
