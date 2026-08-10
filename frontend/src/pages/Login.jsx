import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';

/* ─── Inline wordmark ────────────────────────────────────────────────────── */
const BoltMark = () => (
  <svg width={40} height={40} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect width="32" height="32" rx="8" fill="#ff4f00" />
    <path d="M19 4L9 18h8l-4 10 14-16h-9l3-8z" fill="#fffefb" strokeLinejoin="round" />
  </svg>
);

export const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const res = await login(data);
    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: 'var(--color-canvas)', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Top wordmark */}
      <Link to="/" className="flex items-center gap-2 mb-8 no-underline" style={{ textDecoration: 'none' }}>
        <BoltMark />
        <span style={{ fontWeight: 700, fontSize: 20, color: 'var(--color-ink)', letterSpacing: '-0.3px' }}>
          AutomateX
        </span>
      </Link>

      {/* Auth card */}
      <div className="zap-auth-card w-full" style={{ maxWidth: 440, boxShadow: '0 4px 32px rgba(32,21,21,0.07)' }}>

        <div className="text-center mb-7">
          <h1 style={{ fontSize: 28, fontWeight: 600, color: 'var(--color-ink)', lineHeight: '34px', letterSpacing: '-0.4px', margin: 0 }}>
            Sign in to AutomateX
          </h1>
          <p style={{ fontSize: 16, color: 'var(--color-body)', marginTop: 8 }}>
            Welcome back — let's automate something.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 6 }}>
              Email address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-body-mid)', pointerEvents: 'none' }} />
              <input
                type="email"
                placeholder="you@company.com"
                autoComplete="username"
                className="zap-input"
                style={{ paddingLeft: 40, fontSize: 16, borderColor: errors.email ? '#DC2626' : 'var(--color-ink)' }}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Enter a valid email' },
                })}
              />
            </div>
            {errors.email && (
              <p style={{ fontSize: 13, color: '#DC2626', marginTop: 4 }}>{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
                Password
              </label>
              <span style={{ fontSize: 12, color: 'var(--color-body-mid)', cursor: 'not-allowed' }} title="Coming soon">
                Forgot password?
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-body-mid)', pointerEvents: 'none' }} />
              <input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="zap-input"
                style={{ paddingLeft: 40, fontSize: 16, borderColor: errors.password ? '#DC2626' : 'var(--color-ink)' }}
                {...register('password', { required: 'Password is required' })}
              />
            </div>
            {errors.password && (
              <p style={{ fontSize: 13, color: '#DC2626', marginTop: 4 }}>{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="zap-btn-primary zap-btn-md"
            style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.65 : 1, marginTop: 4 }}
          >
            {loading ? (
              <>
                <span className="zap-pulse">Signing in…</span>
              </>
            ) : (
              <>
                Sign in <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--color-body)', marginTop: 20 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Create one free
          </Link>
        </p>
      </div>

      {/* Footer note */}
      <p style={{ marginTop: 24, fontSize: 13, color: 'var(--color-body-mid)', textAlign: 'center' }}>
        By signing in you agree to our{' '}
        <a href="#" style={{ color: 'var(--color-body)', textDecoration: 'underline' }}>Terms</a>
        {' '}and{' '}
        <a href="#" style={{ color: 'var(--color-body)', textDecoration: 'underline' }}>Privacy Policy</a>.
      </p>
    </div>
  );
};
