import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsersAPI } from '../../api/users';
import type { User } from '../../types/user';
import type { UserRole } from '../../types/auth';

const roleLabels: Record<UserRole, string> = {
  User: 'Khách hàng',
  Admin: 'Quản trị viên',
  Staff: 'Nhân viên'
};

const roleFilters: Array<{ label: string; value?: UserRole }> = [
  { label: 'Tất cả', value: undefined },
  { label: 'Quản trị viên', value: 'Admin' },
  { label: 'Nhân viên', value: 'Staff' },
  { label: 'Khách hàng', value: 'User' }
];

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>(undefined);
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const fetchUsers = useCallback(async (role?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await UsersAPI.getAll(role);
      setUsers(data);
    } catch (err: any) {
      console.error('[AdminUsersPage] Error fetching users:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(roleFilter);
  }, [fetchUsers, roleFilter]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(keyword) ||
        user.phone.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword)
    );
  }, [users, search]);

  const handleDelete = async (user: User) => {
    setConfirmDialog({
      show: true,
      title: 'Xóa người dùng',
      message: `Bạn có chắc muốn xóa người dùng "${user.name}"?\n\nHành động này không thể hoàn tác.`,
      onConfirm: async () => {
        try {
          await UsersAPI.remove(user.id);
          setUsers((prev) => prev.filter((item) => item.id !== user.id));
          setSuccess('Người dùng đã được xóa thành công');
          setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
          console.error('[AdminUsersPage] Error deleting user:', err);
          const message = err.response?.data?.message || 'Không thể xóa người dùng';
          setError(message);
          setTimeout(() => setError(null), 5000);
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleUpdateRole = async (user: User, newRole: UserRole) => {
    if (user.role === newRole) return; // No change
    
    setConfirmDialog({
      show: true,
      title: 'Thay đổi quyền',
      message: `Thay đổi quyền của "${user.name}" thành ${roleLabels[newRole]}?`,
      onConfirm: async () => {
        try {
          const updated = await UsersAPI.updateRole(user.id, { role: newRole });
          setUsers((prev) => prev.map((item) => (item.id === user.id ? updated : item)));
          setSuccess('Cập nhật quyền thành công');
          setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
          console.error('[AdminUsersPage] Error updating role:', err);
          const message = err.response?.data?.message || 'Không thể cập nhật quyền';
          setError(message);
          setTimeout(() => setError(null), 5000);
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleCreateNew = () => {
    navigate('/dashboard/users/new');
  };

  const handleEdit = (user: User) => {
    navigate(`/dashboard/users/${user.id}/edit`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="page dashboard-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Quản lý hệ thống</p>
          <h1>Người dùng</h1>
        </div>
        <button type="button" className="primary-btn" onClick={handleCreateNew}>
          + Tạo người dùng mới
        </button>
      </header>

      {/* Success Message */}
      {success && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem 1.25rem',
          background: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          color: '#155724',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem 1.25rem',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c00',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="filter-group" style={{ marginBottom: '1.5rem' }}>
        {roleFilters.map((item) => (
          <button
            key={item.label}
            className={roleFilter === item.value ? 'chip active' : 'chip'}
            onClick={() => setRoleFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="posts-panel__controls" style={{ marginBottom: '1.5rem' }}>
        <input
          type="search"
          placeholder="Tìm kiếm theo tên, số điện thoại, email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          className="ghost-btn"
          onClick={() => fetchUsers(roleFilter)}
          disabled={loading}
        >
          Tải lại
        </button>
      </div>

      {error && <p className="form-alert error">{error}</p>}

      {loading ? (
        <p>Đang tải danh sách người dùng...</p>
      ) : filteredUsers.length === 0 ? (
        <p className="empty-state">Không tìm thấy người dùng.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>Liên hệ</th>
                <th>Quyền</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>
                    <strong>{user.name}</strong>
                  </td>
                  <td>
                    <p>📱 {user.phone}</p>
                    {user.email && <small>📧 {user.email}</small>}
                  </td>
                  <td>
                    {user.role === 'Admin' ? (
                      <span className="role-badge-admin" style={{ 
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        background: '#e60000',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        Quản trị viên
                      </span>
                    ) : (
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user, e.target.value as UserRole)}
                        className="role-select"
                      >
                        <option value="User">Khách hàng</option>
                        <option value="Staff">Nhân viên</option>
                        <option value="Admin">Quản trị viên</option>
                      </select>
                    )}
                  </td>
                  <td>
                    <small>{formatDate(user.createdAt)}</small>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => handleEdit(user)}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => handleDelete(user)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog && confirmDialog.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }} onClick={() => setConfirmDialog(null)}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            width: '90%',
            maxWidth: '400px',
            overflow: 'hidden'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '1.5rem 1.5rem 1rem 1.5rem',
              borderBottom: '1px solid #e0e0e0'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1a1a1a', fontWeight: '600' }}>
                {confirmDialog.title}
              </h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ 
                margin: 0, 
                fontSize: '0.9375rem', 
                color: '#666', 
                lineHeight: '1.6',
                whiteSpace: 'pre-line'
              }}>
                {confirmDialog.message}
              </p>
            </div>
            <div style={{
              padding: '1rem 1.5rem 1.5rem 1.5rem',
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setConfirmDialog(null)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#f5f5f5',
                  color: '#666',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minWidth: '100px'
                }}
              >
                Hủy
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#e60000',
                  color: 'white',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minWidth: '100px'
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
