import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

/* ─── Bolt wordmark ─────────────────────────────────────────────────────── */
const BoltMark = () => (
  <svg width={40} height={40} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect width="32" height="32" rx="8" fill="#ff4f00" />
    <path d="M19 4L9 18h8l-4 10 14-16h-9l3-8z" fill="#fffefb" strokeLinejoin="round" />
  </svg>
);

const PERKS = [
  'Free forever — no credit card needed',
  '5 active workflows immediately',
  'AI nodes: OpenAI & Gemini included',
];

export const Register = () => {
  const { register: registerAuth, loading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password', '');

  const onSubmit = async (data) => {
    const res = await registerAuth({ name: data.name, email: data.email, password: data.password });
    if (res.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{ backgroundColor: 'var(--color-canvas)', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ── Left panel (cream-soft) — brand / perks ───────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-center p-16"
        style={{ backgroundColor: 'var(--color-canvas-soft)', flex: '0 0 420px', borderRight: '1px solid var(--color-mute)' }}
      >
        <div className="space-y-10">
          <div>
            <Link to="/" className="flex items-center gap-2 no-underline mb-10" style={{ textDecoration: 'none' }}>
              <BoltMark />
              <span style={{ fontWeight: 700, fontSize: 20, color: 'var(--color-ink)' }}>AutomateX</span>
            </Link>
            <h2 style={{ fontSize: 36, fontWeight: 500, color: 'var(--color-ink)', lineHeight: '40px', letterSpacing: '-0.02em' }}>
              Automate anything.<br />
              <span style={{ color: 'var(--color-primary)' }}>No code.</span>
            </h2>
            <p style={{ fontSize: 17, color: 'var(--color-body)', marginTop: 12, lineHeight: '26px' }}>
              Join 12,000+ teams who use AutomateX to connect apps, run AI workflows, and ship faster.
            </p>
          </div>
          <ul className="space-y-4">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-3">
                <CheckCircle2 size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                <span style={{ fontSize: 16, color: 'var(--color-ink-mid)' }}>{perk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Right panel — registration form ─────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Mobile wordmark */}
        <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden no-underline" style={{ textDecoration: 'none' }}>
          <BoltMark />
          <span style={{ fontWeight: 700, fontSize: 20, color: 'var(--color-ink)' }}>AutomateX</span>
        </Link>

        <div className="w-full" style={{ maxWidth: 440 }}>
          <div className="mb-7">
            <h1 style={{ fontSize: 28, fontWeight: 600, color: 'var(--color-ink)', lineHeight: '34px', letterSpacing: '-0.4px', margin: 0 }}>
              Create your account
            </h1>
            <p style={{ fontSize: 16, color: 'var(--color-body)', marginTop: 6 }}>
              It's free. No credit card required.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Full name */}
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 6 }}>
                Full name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-body-mid)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Divyansh Kumar"
                  autoComplete="name"
                  className="zap-input"
                  style={{ paddingLeft: 40, fontSize: 16, borderColor: errors.name ? '#DC2626' : 'var(--color-ink)' }}
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: { value: 3, message: 'At least 3 characters' },
                    maxLength: { value: 50, message: 'At most 50 characters' },
                  })}
                />
              </div>
              {errors.name && <p style={{ fontSize: 13, color: '#DC2626', marginTop: 4 }}>{errors.name.message}</p>}
            </div>

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
                  autoComplete="email"
                  className="zap-input"
                  style={{ paddingLeft: 40, fontSize: 16, borderColor: errors.email ? '#DC2626' : 'var(--color-ink)' }}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Enter a valid email' },
                  })}
                />
              </div>
              {errors.email && <p style={{ fontSize: 13, color: '#DC2626', marginTop: 4 }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-body-mid)', pointerEvents: 'none' }} />
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className="zap-input"
                  style={{ paddingLeft: 40, fontSize: 16, borderColor: errors.password ? '#DC2626' : 'var(--color-ink)' }}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'At least 8 characters' },
                  })}
                />
              </div>
              {errors.password && <p style={{ fontSize: 13, color: '#DC2626', marginTop: 4 }}>{errors.password.message}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 6 }}>
                Confirm password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-body-mid)', pointerEvents: 'none' }} />
                <input
                  type="password"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className="zap-input"
                  style={{ paddingLeft: 40, fontSize: 16, borderColor: errors.confirmPassword ? '#DC2626' : 'var(--color-ink)' }}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (v) => v === password || 'Passwords do not match',
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p style={{ fontSize: 13, color: '#DC2626', marginTop: 4 }}>{errors.confirmPassword.message}</p>
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
                <span className="zap-pulse">Creating account…</span>
              ) : (
                <>
                  Create free account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--color-body)', marginTop: 20 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-body-mid)', marginTop: 16 }}>
            By creating an account you agree to our{' '}
            <a href="#" style={{ color: 'var(--color-body)', textDecoration: 'underline' }}>Terms</a>{' '}
            and{' '}
            <a href="#" style={{ color: 'var(--color-body)', textDecoration: 'underline' }}>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
