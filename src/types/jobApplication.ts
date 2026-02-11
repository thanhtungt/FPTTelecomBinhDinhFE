export type JobApplicationStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';

export interface JobApplication {
  id: number;
  jobPostingId: number;
  jobPostingTitle?: string | null;
  jobPostingPosition?: string | null;
  fullName: string;
  email: string;
  phone: string;
  address?: string | null;
  coverLetter?: string | null;
  resumeUrl?: string | null;
  status: JobApplicationStatus;
  reviewedByUserId?: number | null;
  reviewedByUserName?: string | null;
  reviewNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobApplicationPayload {
  jobPostingId: number;
  fullName: string;
  email: string;
  phone: string;
  address?: string | null;
  coverLetter?: string | null;
  resumeUrl?: string | null;
}

export interface UpdateJobApplicationStatusPayload {
  status: JobApplicationStatus;
  reviewNote?: string | null;
}
