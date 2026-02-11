export type JobPostingStatus = "draft" | "active" | "closed" | "expired";

export interface JobPosting {
  id: number;
  title: string;
  description: string;
  position: string;
  department: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  numberOfPositions: number;
  applicationDeadline?: string | null;
  status: JobPostingStatus;
  createdByUserId: number;
  createdByUserName?: string | null;
  createdAt: string;
  updatedAt: string;
  applicationCount: number;
}

export interface CreateJobPostingPayload {
  title: string;
  description: string;
  position: string;
  department: string;
  location: string;
  employmentType?: string;
  experienceLevel?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  requirements?: string | null;
  benefits?: string | null;
  numberOfPositions?: number;
  applicationDeadline?: string | null;
}

export interface UpdateJobPostingPayload {
  title: string;
  description: string;
  position: string;
  department: string;
  location: string;
  employmentType?: string;
  experienceLevel?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  requirements?: string | null;
  benefits?: string | null;
  numberOfPositions?: number;
  applicationDeadline?: string | null;
  status: JobPostingStatus;
}
