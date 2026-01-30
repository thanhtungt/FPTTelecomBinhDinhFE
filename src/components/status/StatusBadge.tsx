import { REGISTRATION_STATUS_FLOW } from '../../constants/registration';
import type { RegistrationStatus } from '../../types/registration';

interface StatusBadgeProps {
  status: RegistrationStatus | string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const meta = REGISTRATION_STATUS_FLOW.find((item) => item.key === status);
  const color = meta?.accent ?? '#94a3b8';
  const label = meta?.label ?? status;

  return (
    <span className="status-badge" style={{ borderColor: color, color }}>
      {label}
    </span>
  );
};

export default StatusBadge;
