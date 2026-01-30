import { REGISTRATION_STATUS_FLOW } from '../../constants/registration';
import type { RegistrationStatus } from '../../types/registration';

interface RegistrationTimelineProps {
  current?: RegistrationStatus | string;
}

const RegistrationTimeline = ({ current }: RegistrationTimelineProps) => {
  const currentIndex = REGISTRATION_STATUS_FLOW.findIndex((step) => step.key === current);
  return (
    <div className="timeline">
      {REGISTRATION_STATUS_FLOW.map((step, idx) => {
        const isActive = currentIndex >= 0 && idx <= currentIndex;
        return (
          <div key={step.key} className={`timeline__step ${isActive ? 'active' : ''}`}>
            <span
              className="timeline__dot"
              style={{ borderColor: isActive ? step.accent : 'var(--divider)', background: isActive ? step.accent : 'transparent' }}
            />
            <div>
              <p>{step.label}</p>
              <small>{step.summary}</small>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RegistrationTimeline;
