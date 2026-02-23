import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UsersAPI } from '../../api/users';
import type { User, CreateUserPayload, UpdateUserPayload } from '../../types/user';
import type { UserRole } from '../../types/auth';

const AdminUserEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!id;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'User' as UserRole
  });

  // Load user for edit mode
  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await UsersAPI.getById(parseInt(id, 10));
        setUser(data);
        setFormData({
          name: data.name,
          email: data.email || '',
          phone: data.phone,
          password: '',
          confirmPassword: '',
          role: data.role
        });
      } catch (err: any) {
        console.error('[AdminUserEditorPage] Error fetching user:', err);
        const message = err.response?.data?.message || 'Không thể tải thông tin người dùng';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Vui lòng nhập họ tên');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setError('Số điện thoại không hợp lệ (10-11 số)');
      return;
    }

    // Email validation (optional)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setError('Email không hợp lệ');
        return;
      }
    }

    // Password validation for create mode
    if (!isEditMode) {
      if (!formData.password) {
        setError('Vui lòng nhập mật khẩu');
        return;
      }
      if (formData.password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        return;
      }
    } else {
      // For edit mode, only validate if password is being changed
      if (formData.password) {
        if (formData.password.length < 6) {
          setError('Mật khẩu phải có ít nhất 6 ký tự');
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Mật khẩu xác nhận không khớp');
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      if (isEditMode && user) {
        const payload: UpdateUserPayload = {
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim(),
          password: formData.password ? formData.password : undefined
        };
        await UsersAPI.update(user.id, payload);
      } else {
        const payload: CreateUserPayload = {
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim(),
          password: formData.password,
          role: formData.role
        };
        await UsersAPI.create(payload);
      }
      navigate('/dashboard/users');
    } catch (err: any) {
      console.error('[AdminUserEditorPage] Error:', err);
      const message = err.response?.data?.message || 'Không thể lưu người dùng';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/users');
  };

  if (loading) {
    return (
      <div className="container">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Quản lý hệ thống</p>
          <h1>{isEditMode ? 'Chỉnh sửa người dùng' : 'Tạo người dùng mới'}</h1>
        </div>
      </header>

      {error && (
        <div className="form-alert" style={{ 
          marginBottom: '1.5rem', 
          padding: '1rem 1.25rem',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c00'
        }}>
          ⚠️ {error}
        </div>
      )}

      {isEditMode && user && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem 1.5rem',
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#666' }}>
            Đang chỉnh sửa người dùng
          </p>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '1.125rem' }}>#{user.id}</strong>
            </div>
            <div>
              <strong>{user.name}</strong>
              <span style={{ 
                marginLeft: '0.75rem',
                padding: '0.25rem 0.5rem',
                background: user.role === 'Admin' ? '#e60000' : user.role === 'Staff' ? '#0066cc' : '#666',
                color: 'white',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {user.role === 'Admin' ? 'Quản trị viên' : user.role === 'Staff' ? 'Nhân viên' : 'Khách hàng'}
              </span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '2rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Họ tên */}
          <div className="form-group">
            <label htmlFor="name" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              color: '#333'
            }}>
              👤 Họ tên <span style={{ color: '#e60000' }}>*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              required
              disabled={submitting}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '0.9375rem'
              }}
            />
          </div>

          {/* Số điện thoại */}
          <div className="form-group">
            <label htmlFor="phone" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              color: '#333'
            }}>
              📱 Số điện thoại <span style={{ color: '#e60000' }}>*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0901234567"
              required
              disabled={submitting}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '0.9375rem'
              }}
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              color: '#333'
            }}>
              📧 Email <span style={{ fontSize: '0.75rem', color: '#999' }}>(tùy chọn)</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@fpt.com.vn"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '0.9375rem'
              }}
            />
          </div>

          {/* Quyền - Only show for create mode */}
          {!isEditMode && (
            <div className="form-group">
              <label htmlFor="role" style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: '#333'
              }}>
                🔑 Quyền <span style={{ color: '#e60000' }}>*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9375rem',
                  background: 'white'
                }}
              >
                <option value="User">Khách hàng</option>
                <option value="Staff">Nhân viên</option>
                <option value="Admin">Quản trị viên</option>
              </select>
            </div>
          )}

          {/* Mật khẩu */}
          <div className="form-group">
            <label htmlFor="password" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              color: '#333'
            }}>
              🔐 {isEditMode ? 'Mật khẩu mới' : 'Mật khẩu'}{' '}
              {!isEditMode && <span style={{ color: '#e60000' }}>*</span>}
              {isEditMode && <span style={{ fontSize: '0.75rem', color: '#999' }}>(để trống nếu không đổi)</span>}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={isEditMode ? '••••••' : '••••••'}
              required={!isEditMode}
              disabled={submitting}
              minLength={6}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '0.9375rem'
              }}
            />
            <small style={{ display: 'block', marginTop: '0.25rem', color: '#666', fontSize: '0.75rem' }}>
              Tối thiểu 6 ký tự
            </small>
          </div>

          {/* Xác nhận mật khẩu */}
          <div className="form-group">
            <label htmlFor="confirmPassword" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              color: '#333'
            }}>
              🔐 Xác nhận mật khẩu{' '}
              {!isEditMode && <span style={{ color: '#e60000' }}>*</span>}
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••"
              required={!isEditMode || !!formData.password}
              disabled={submitting}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '0.9375rem'
              }}
            />
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e0e0e0'
        }}>
          <button
            type="button"
            className="ghost-btn"
            onClick={handleCancel}
            disabled={submitting}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              background: 'white',
              color: '#666',
              fontSize: '0.9375rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="primary-btn"
            disabled={submitting}
            style={{
              padding: '0.75rem 2rem',
              border: 'none',
              borderRadius: '6px',
              background: submitting ? '#ccc' : '#e60000',
              color: 'white',
              fontSize: '0.9375rem',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {submitting ? '⏳ Đang lưu...' : isEditMode ? '✓ Cập nhật' : '+ Tạo mới'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminUserEditorPage;
