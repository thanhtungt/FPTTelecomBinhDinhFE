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
    <div className="auth-page">
      <section>
        <p className="eyebrow">Đăng nhập</p>
        <h1>Đăng nhập để theo dõi các đơn đăng ký lắp đặt của bạn.</h1>
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <label>
            <span>Số điện thoại</span>
            <input type="tel" placeholder="0912 345 678" {...register('phone')} />
            {errors.phone && <small>{errors.phone.message}</small>}
          </label>
          <label>
            <span>Mật khẩu</span>
            <input type="password" placeholder="••••••••" {...register('password')} />
            {errors.password && <small>{errors.password.message}</small>}
          </label>
          {error && <p className="form-alert">{error}</p>}
          <button type="submit" className="primary-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <p className="auth-switch">
          Chưa có tài khoản? <Link to="/register">Đăng ký →</Link>
        </p>
      </section>
    </div>
  );
};

export default LoginPage;
