import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Flame, User, Mail, Lock, ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Zap } from 'lucide-react';

const PERKS = [
  'Unlimited visual DAG workflows',
  'Real-time execution logs & debug inspector',
  'Encrypted Vault: Discord, Sheets, Slack, Gmail',
  'Integrated AI workflow generation with OpenAI & Gemini',
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row relative overflow-hidden font-sans selection:bg-brand-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="fixed top-1/4 left-1/4 w-[32rem] h-[32rem] bg-brand-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ── Left panel — brand / perks ───────────────────── */}
      <div className="hidden lg:flex flex-col justify-between p-16 flex-[0_0_460px] glass-panel-subtle border-r border-slate-800/80 relative z-10 backdrop-blur-2xl">
        <div className="space-y-12">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white shadow-glow-brand group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 fill-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white group-hover:text-brand-400 transition-colors">
              AutomateX
            </span>
          </Link>

          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
              Automate anything.<br />
              <span className="text-gradient-brand">Ship in minutes.</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect your applications, trigger webhooks, build complex logic branches, and inspect executions in real-time.
            </p>
          </div>

          <ul className="space-y-3.5 pt-2">
            {PERKS.map((perk, i) => (
              <li key={i} className="flex items-center gap-3 text-xs text-slate-300">
                <div className="p-1 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Enterprise Grade v1.4</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
          </span>
        </div>
      </div>

      {/* ── Right panel — registration form ─────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {/* Mobile wordmark */}
        <Link to="/" className="flex items-center gap-2.5 mb-8 lg:hidden group">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white shadow-glow-brand">
            <Flame className="w-6 h-6 fill-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">AutomateX</span>
        </Link>

        <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Create your account
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Start building autonomous workflows for free.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Full name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Full name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Divyansh Singh"
                  autoComplete="name"
                  className={`w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none ${
                    errors.name ? 'border-rose-500 focus:border-rose-500' : 'focus:border-brand-500'
                  }`}
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: { value: 3, message: 'At least 3 characters' },
                    maxLength: { value: 50, message: 'At most 50 characters' },
                  })}
                />
              </div>
              {errors.name && <p className="text-[11px] text-rose-400 font-medium">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  className={`w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none ${
                    errors.email ? 'border-rose-500 focus:border-rose-500' : 'focus:border-brand-500'
                  }`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Enter a valid email' },
                  })}
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-400 font-medium">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className={`w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none ${
                    errors.password ? 'border-rose-500 focus:border-rose-500' : 'focus:border-brand-500'
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'At least 8 characters' },
                  })}
                />
              </div>
              {errors.password && <p className="text-[11px] text-rose-400 font-medium">{errors.password.message}</p>}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className={`w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none ${
                    errors.confirmPassword ? 'border-rose-500 focus:border-rose-500' : 'focus:border-brand-500'
                  }`}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (v) => v === password || 'Passwords do not match',
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-rose-400 font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-glow-brand flex items-center justify-center gap-2 disabled:opacity-60 hover:scale-[1.01]"
            >
              {loading ? (
                <span className="animate-pulse">Creating account…</span>
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

