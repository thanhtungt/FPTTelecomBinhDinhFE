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
    <div className="auth-page">
      <section>
        <p className="eyebrow">Register</p>
        <h1>Open an account to track every install milestone.</h1>
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <label>
            <span>Full name</span>
            <input type="text" placeholder="Nguyen Van A" {...register('name')} />
            {errors.name && <small>{errors.name.message}</small>}
          </label>
          <label>
            <span>Email</span>
            <input type="email" placeholder="you@studio.vn" {...register('email')} />
            {errors.email && <small>{errors.email.message}</small>}
          </label>
          <label>
            <span>Phone</span>
            <input type="tel" placeholder="0912 345 678" {...register('phone')} />
            {errors.phone && <small>{errors.phone.message}</small>}
          </label>
          <label>
            <span>Password</span>
            <input type="password" placeholder="••••••••" {...register('password')} />
            {errors.password && <small>{errors.password.message}</small>}
          </label>
          {error && <p className="form-alert">{error}</p>}
          <button type="submit" className="primary-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create account'}
          </button>
        </form>
        <p className="auth-switch">
          Already have account? <Link to="/login">Sign in →</Link>
        </p>
      </section>
    </div>
  );
};

export default RegisterPage;
