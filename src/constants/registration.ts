import type { RegistrationStatus } from '../types/registration';

export const REGISTRATION_STATUS_FLOW: Array<{
  key: RegistrationStatus;
  label: string;
  summary: string;
  accent: string;
}> = [
  { key: 'pending', label: 'Đang chờ', summary: 'Yêu cầu mới đang chờ nhân viên.', accent: '#f97316' },
  { key: 'contacting', label: 'Đang gọi', summary: 'Đội ngũ đang gọi khách hàng.', accent: '#fb923c' },
  { key: 'need_survey', label: 'Đang khảo sát', summary: 'Đội ngũ cần khảo sát.', accent: '#facc15' },
  { key: 'surveyed', label: 'Đã khảo sát', summary: 'Đội ngũ đã khảo sát.', accent: '#22c55e' },
  { key: 'contract_signed', label: 'Đã ký hợp đồng', summary: 'Khách hàng đã ký hợp đồng.', accent: '#14b8a6' },
  { key: 'installation_scheduled', label: 'Đã lên lịch', summary: 'Đội ngũ đã lên lịch.', accent: '#0ea5e9' },
  { key: 'installed', label: 'Đã lắp đặt', summary: 'Hardware đã lắp đặt.', accent: '#6366f1' },
  { key: 'done', label: 'Hoàn thành', summary: 'Yêu cầu đã hoàn thành.', accent: '#8b5cf6' },
  { key: 'cancelled', label: 'Hủy', summary: 'Yêu cầu đã hủy.', accent: '#ef4444' }
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
