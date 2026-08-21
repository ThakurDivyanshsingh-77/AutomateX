import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Flame, Mail, Lock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-brand-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="fixed top-1/4 left-1/3 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top wordmark */}
      <Link to="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
          <Flame className="w-6 h-6 fill-white" />
        </div>
        <span className="font-extrabold text-2xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
          AutomateX
        </span>
      </Link>

      {/* Auth card */}
      <div className="bg-white w-full max-w-md rounded-3xl p-8 border border-slate-200 shadow-xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sign in to AutomateX
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Welcome back — orchestrate your automated workflows.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="you@company.com"
                autoComplete="username"
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/15 ${
                  errors.email ? 'border-rose-500 focus:border-rose-500' : 'focus:border-brand-500'
                }`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Enter a valid email' },
                })}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Password
              </label>
              <span className="text-[11px] text-slate-400 cursor-not-allowed" title="Self-service reset coming soon">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/15 ${
                  errors.password ? 'border-rose-500 focus:border-rose-500' : 'focus:border-brand-500'
                }`}
                {...register('password', { required: 'Password is required' })}
              />
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-60 hover:scale-[1.01]"
          >
            {loading ? (
              <span className="animate-pulse">Signing in…</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-600 hover:text-brand-700 font-semibold transition-colors">
            Create one free
          </Link>
        </p>
      </div>

      {/* Footer note */}
      <p className="mt-8 text-xs text-slate-400 text-center">
        Enterprise DAG Workflow Automation Platform · AutomateX
      </p>
    </div>
  );
};

