import { useEffect, useState } from 'react';
import { RegistrationAPI } from '../../api/registrations';
import type { Registration } from '../../types/registration';
import StatusBadge from '../../components/status/StatusBadge';
import RegistrationTimeline from '../../components/status/RegistrationTimeline';
import { formatCurrency, formatDate } from '../../utils/format';

const MyRegistrationsPage = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchMine = async () => {
      try {
        const data = await RegistrationAPI.getMine();
        if (!mounted) return;
        setRegistrations(data);
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchMine();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="page my-registrations">
      <header className="page-header">
        <div>
          <p className="eyebrow">Đơn đăng ký của tôi</p>
          <h1> Theo dõi các đơn đăng ký của bạn</h1>
        </div>
      </header>
      {loading && <p>Loading registrations...</p>}
      {!loading && registrations.length === 0 && <p>No registrations yet.</p>}
      <div className="stack">
        {registrations.map((item) => (
          <article key={item.id} className="registration-card">
            <header>
              <div>
                <h3>{item.packageName}</h3>
                <p>{formatCurrency(item.packagePrice)} / month</p>
              </div>
              <StatusBadge status={item.status} />
            </header>
            <div className="registration-card__meta">
              <p>
                <strong>Địa chỉ:</strong> {item.address}
              </p>
              <p>
                <strong>Ngày cập nhật:</strong> {formatDate(item.updatedAt)}
              </p>
              <p>
                <strong>Nhân viên:</strong> {item.assignedStaffName ?? 'Chưa giao phó'}
              </p>
            </div>
            <RegistrationTimeline current={item.status} />
          </article>
        ))}
      </div>
    </div>
  );
};

export default MyRegistrationsPage;
