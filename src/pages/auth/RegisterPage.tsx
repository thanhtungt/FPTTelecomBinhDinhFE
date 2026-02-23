import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const schema = z.object({
  name: z.string().min(3, 'Full name is required'),
  email: z.string().email('Email is invalid').optional().or(z.literal('')),
  phone: z.string().min(9, 'Phone is required'),
  password: z.string().min(6, 'Password must be 6+ chars')
});

type RegisterValues = z.infer<typeof schema>;

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: RegisterValues) => {
    setError(null);
    try {
      await registerUser({ ...values, email: values.email || undefined });
      navigate('/dashboard/my-registrations');
    } catch (err) {
      setError('Phone already registered.');
      console.error(err);
    }
  };

  return (
    <div className="auth-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        padding: '3rem 2.5rem'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          
          <p style={{
            fontSize: '0.875rem',
            color: '#e60000',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '0.5rem'
          }}>
            Đăng ký
          </p>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1a1a1a',
            margin: 0,
            lineHeight: 1.3
          }}>
            Tạo tài khoản mới
          </h1>
          <p style={{
            fontSize: '0.9375rem',
            color: '#666',
            marginTop: '0.5rem'
          }}>
            Đăng ký để theo dõi đơn đăng ký lắp đặt
          </p>
        </div>

        {/* Error Alert */}
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
            gap: '0.5rem',
            fontSize: '0.9375rem'
          }}>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Name Field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              color: '#333'
            }}>
              Họ và tên
            </label>
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              {...register('name')}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: errors.name ? '2px solid #fcc' : '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                transition: 'border 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => {
                if (!errors.name) e.target.style.borderColor = '#e60000';
              }}
              onBlur={(e) => {
                if (!errors.name) e.target.style.borderColor = '#ddd';
              }}
            />
            {errors.name && (
              <small style={{
                display: 'block',
                marginTop: '0.375rem',
                color: '#c00',
                fontSize: '0.8125rem'
              }}>
                {errors.name.message}
              </small>
            )}
          </div>

          {/* Email Field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              color: '#333'
            }}>
              Email <span style={{ fontSize: '0.75rem', color: '#999', fontWeight: '400' }}>(tùy chọn)</span>
            </label>
            <input
              type="email"
              placeholder="example@email.com"
              {...register('email')}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: errors.email ? '2px solid #fcc' : '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                transition: 'border 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => {
                if (!errors.email) e.target.style.borderColor = '#e60000';
              }}
              onBlur={(e) => {
                if (!errors.email) e.target.style.borderColor = '#ddd';
              }}
            />
            {errors.email && (
              <small style={{
                display: 'block',
                marginTop: '0.375rem',
                color: '#c00',
                fontSize: '0.8125rem'
              }}>
                {errors.email.message}
              </small>
            )}
          </div>

          {/* Phone Field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              color: '#333'
            }}>
              Số điện thoại
            </label>
            <input
              type="tel"
              placeholder="0912345678"
              {...register('phone')}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: errors.phone ? '2px solid #fcc' : '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                transition: 'border 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => {
                if (!errors.phone) e.target.style.borderColor = '#e60000';
              }}
              onBlur={(e) => {
                if (!errors.phone) e.target.style.borderColor = '#ddd';
              }}
            />
            {errors.phone && (
              <small style={{
                display: 'block',
                marginTop: '0.375rem',
                color: '#c00',
                fontSize: '0.8125rem'
              }}>
                {errors.phone.message}
              </small>
            )}
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              color: '#333'
            }}>
              Mật khẩu
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: errors.password ? '2px solid #fcc' : '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                transition: 'border 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => {
                if (!errors.password) e.target.style.borderColor = '#e60000';
              }}
              onBlur={(e) => {
                if (!errors.password) e.target.style.borderColor = '#ddd';
              }}
            />
            {errors.password && (
              <small style={{
                display: 'block',
                marginTop: '0.375rem',
                color: '#c00',
                fontSize: '0.8125rem'
              }}>
                {errors.password.message}
              </small>
            )}
            <small style={{
              display: 'block',
              marginTop: '0.375rem',
              color: '#666',
              fontSize: '0.75rem'
            }}>
              Tối thiểu 6 ký tự
            </small>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '1rem',
              border: 'none',
              borderRadius: '8px',
              background: isSubmitting ? '#ccc' : 'linear-gradient(135deg, #e60000 0%, #cc0000 100%)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: isSubmitting ? 'none' : '0 4px 16px rgba(230, 0, 0, 0.3)',
              marginTop: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(230, 0, 0, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(230, 0, 0, 0.3)';
              }
            }}
          >
            {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.9375rem',
            color: '#666',
            margin: 0
          }}>
            Đã có tài khoản?{' '}
            <Link to="/login" style={{
              color: '#e60000',
              fontWeight: '600',
              textDecoration: 'none'
            }}>
              Đăng nhập ngay →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
