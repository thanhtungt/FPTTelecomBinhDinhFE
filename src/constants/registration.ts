import type { RegistrationStatus } from '../types/registration';

export const REGISTRATION_STATUS_FLOW: Array<{
  key: RegistrationStatus;
  label: string;
  summary: string;
  accent: string;
}> = [
  { key: 'pending', label: 'Pending', summary: 'New request waiting for staff.', accent: '#f97316' },
  { key: 'contacting', label: 'Contacting', summary: 'Team is calling the customer.', accent: '#fb923c' },
  { key: 'need_survey', label: 'Need Survey', summary: 'Survey visit is required.', accent: '#facc15' },
  { key: 'surveyed', label: 'Surveyed', summary: 'Site survey finished.', accent: '#22c55e' },
  { key: 'contract_signed', label: 'Contract Signed', summary: 'Customer signed paperwork.', accent: '#14b8a6' },
  { key: 'installation_scheduled', label: 'Install Scheduled', summary: 'Installation date is set.', accent: '#0ea5e9' },
  { key: 'installed', label: 'Installed', summary: 'Hardware installed on site.', accent: '#6366f1' },
  { key: 'done', label: 'Completed', summary: 'Project closed successfully.', accent: '#8b5cf6' },
  { key: 'cancelled', label: 'Cancelled', summary: 'Request cancelled.', accent: '#ef4444' }
];

export const REGISTRATION_STATUS_LABEL: Record<RegistrationStatus, string> = REGISTRATION_STATUS_FLOW.reduce(
  (acc, item) => ({ ...acc, [item.key]: item.label }),
  {} as Record<RegistrationStatus, string>
);

export const REGISTRATION_STATUS_TRANSITIONS: Record<RegistrationStatus, RegistrationStatus[]> = {
  pending: ['contacting', 'cancelled'],
  contacting: ['need_survey', 'cancelled'],
  need_survey: ['surveyed', 'cancelled'],
  surveyed: ['contract_signed', 'cancelled'],
  contract_signed: ['installation_scheduled', 'cancelled'],
  installation_scheduled: ['installed', 'cancelled'],
  installed: ['done'],
  done: [],
  cancelled: []
};
