import { useEffect, useState } from 'react';
import { RegistrationAPI } from '../../api/registrations';
import { REGISTRATION_STATUS_LABEL, REGISTRATION_STATUS_TRANSITIONS } from '../../constants/registration';
import type { Registration, RegistrationStatus } from '../../types/registration';
import StatusBadge from '../../components/status/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/format';

const statusFilters: Array<{ label: string; value?: RegistrationStatus }> = [
  { label: 'All', value: undefined },
  { label: 'Đang chờ', value: 'pending' },
  { label: 'Liên hệ', value: 'contacting' },
  { label: 'Đang khảo sát', value: 'need_survey' },
  { label: 'Đã lắp đặt', value: 'installed' },
  { label: 'Hoàn thành', value: 'done' }
];

const AdminRegistrationsPage = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RegistrationStatus | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistrations = async (status?: RegistrationStatus) => {
    setLoading(true);
    setError(null);
    try {
      const data = await RegistrationAPI.getAll(status);
      setRegistrations(data);
    } catch (err) {
      setError('Không thể tải đăng ký');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations(filter);
  }, [filter]);

  const handleStatusChange = async (registration: Registration, next: RegistrationStatus) => {
    try {
      const updated = await RegistrationAPI.updateStatus(registration.id, { status: next });
      setRegistrations((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError('Không thể cập nhật trạng thái. Kiểm tra các chuyển đổi hợp lệ.');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa đăng ký này?')) return;
    try {
      await RegistrationAPI.remove(id);
      setRegistrations((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError('Không thể xóa đăng ký.');
      console.error(err);
    }
  };

  const handleAssign = async (id: number) => {
    const staffId = window.prompt('Nhập ID nhân viên để gán');
    if (!staffId) return;
    try {
      const updated = await RegistrationAPI.assignStaff(id, Number(staffId));
      setRegistrations((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError('Không thể gán nhân viên.');
      console.error(err);
    }
  };

  return (
    <div className="page dashboard-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Hoạt động</p>
          <h1>Đăng ký</h1>
        </div>
        <div className="filter-group">
          {statusFilters.map((item) => (
            <button
              key={item.label}
              className={filter === item.value ? 'chip active' : 'chip'}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>
      {error && <p className="form-alert">{error}</p>}
      {loading ? (
        <p>Đang tải bảng...</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Liên hệ</th>
                <th>Khối lượng</th>
                <th>Trạng thái</th>
                <th>Nhân viên</th>
                <th>Cập nhật</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((item) => {
                const transitions = REGISTRATION_STATUS_TRANSITIONS[item.status as RegistrationStatus] ?? [];
                return (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.fullName}</strong>
                      <p>{item.address}</p>
                    </td>
                    <td>
                      <p>{item.phone}</p>
                      <small>{item.userName ?? 'Khách'}</small>
                    </td>
                    <td>
                      <p>{item.packageName}</p>
                      <small>{formatCurrency(item.packagePrice)}</small>
                    </td>
                    <td>
                      <StatusBadge status={item.status as RegistrationStatus} />
                    </td>
                    <td>
                      <p>{item.assignedStaffName ?? 'Chưa gán'}</p>
                      <small>{item.assignedStaffId ? `ID ${item.assignedStaffId}` : ''}</small>
                    </td>
                    <td>
                      <small>{formatDate(item.updatedAt)}</small>
                    </td>
                    <td>
                      <div className="table-actions">
                        {transitions.length > 0 && (
                          <select onChange={(e) => handleStatusChange(item, e.target.value as RegistrationStatus)} defaultValue="">
                            <option value="" disabled>
                              Cập nhật trạng thái
                            </option>
                            {transitions.map((status) => (
                              <option key={status} value={status}>
                                {REGISTRATION_STATUS_LABEL[status]}
                              </option>
                            ))}
                          </select>
                        )}
                        <button className="ghost-btn" onClick={() => handleAssign(item.id)}>
                          Gán nhân viên
                        </button>
                        <button className="danger-btn" onClick={() => handleDelete(item.id)}>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRegistrationsPage;
