export type RegistrationStatus =
  | 'pending'
  | 'contacting'
  | 'need_survey'
  | 'surveyed'
  | 'contract_signed'
  | 'installation_scheduled'
  | 'installed'
  | 'cancelled'
  | 'done';

export interface Registration {
  id: number;
  userId?: number | null;
  userName?: string | null;
  fullName: string;
  phone: string;
  address: string;
  packageId: number;
  packageName: string;
  packagePrice: number;
  note?: string | null;
  status: RegistrationStatus | string;
  assignedStaffId?: number | null;
  assignedStaffName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRegistrationPayload {
  userId?: number;
  fullName: string;
  phone: string;
  address: string;
  packageId: number;
  note?: string;
}

export interface UpdateRegistrationPayload {
  status: RegistrationStatus;
  assignedStaffId?: number;
}
