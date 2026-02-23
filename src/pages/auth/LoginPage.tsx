import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const schema = z.object({
  phone: z.string().min(9, 'Phone is required'),
  password: z.string().min(6, 'Password must be 6+ chars')
});

type LoginValues = z.infer<typeof schema>;

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: LoginValues) => {
    setError(null);
    try {
      const user = await login(values);
      if (user.role === 'Admin' || user.role === 'Staff') {
        navigate('/dashboard/registrations');
      } else {
        navigate('/dashboard/my-registrations');
      }
    } catch (err) {
      setError('Incorrect phone or password.');
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
        maxWidth: '480px',
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
            Đăng nhập
          </p>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1a1a1a',
            margin: 0,
            lineHeight: 1.3
          }}>
            Chào mừng trở lại
          </h1>
          <p style={{
            fontSize: '0.9375rem',
            color: '#666',
            marginTop: '0.5rem'
          }}>
            Đăng nhập để theo dõi đơn đăng ký của bạn
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
          {/* Phone Field */}
          <div style={{ marginBottom: '1.5rem' }}>
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
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
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
            Chưa có tài khoản?{' '}
            <Link to="/register" style={{
              color: '#e60000',
              fontWeight: '600',
              textDecoration: 'none'
            }}>
              Đăng ký ngay →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
