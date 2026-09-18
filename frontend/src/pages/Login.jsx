import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Flame,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Play,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Caps lock detection
  const handleKeyDown = (e) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  const handleKeyUp = (e) => {
    if (e.getModifierState && !e.getModifierState('CapsLock')) {
      setCapsLockActive(false);
    }
  };

  // Demo Credentials One-Click Filler
  const handleFillDemo = () => {
    setValue('email', 'demo@automatex.io', { shouldValidate: true });
    setValue('password', 'AutomateX@2026', { shouldValidate: true });
    toast.success('Demo credentials loaded! Click Sign In or press Enter.');
  };

  const handleSocialMock = (provider) => {
    toast(`Redirecting to secure ${provider} SSO authentication…`, {
      icon: '🔐',
    });
  };

  const handleForgotPassword = () => {
    toast('Self-service password recovery is enabled for enterprise domains. Contact admin@automatex.io for instant reset.', {
      icon: 'ℹ️',
      duration: 5000,
    });
  };

  const onSubmit = async (data) => {
    const res = await login({ email: data.email, password: data.password });
    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-brand-500 selection:text-white auth-grid-pattern">
      {/* Ambient background glows */}
      <div className="fixed top-12 left-1/4 w-96 h-96 bg-gradient-to-br from-orange-500/10 via-amber-400/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10 animate-auth-orb-1" />
      <div className="fixed bottom-12 right-1/4 w-[30rem] h-[30rem] bg-gradient-to-tl from-brand-600/10 via-rose-500/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10 animate-auth-orb-2" />

      {/* Floating Decorative DAG Nodes (Desktop Motion Elements) */}
      <div className="hidden xl:flex items-center gap-3 absolute top-28 left-16 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-900/5 animate-auth-float-a pointer-events-none select-none z-0">
        <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200/80 text-brand-600 flex items-center justify-center">
          <Zap className="w-4 h-4 fill-brand-500" />
        </div>
        <div className="text-left">
          <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
            Webhook Trigger
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </p>
          <p className="text-[10px] text-slate-400 font-mono">POST /v1/incoming · 200 OK</p>
        </div>
      </div>

      <div className="hidden xl:flex items-center gap-3 absolute bottom-24 right-16 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-900/5 animate-auth-float-b pointer-events-none select-none z-0">
        <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-200/80 text-violet-600 flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="text-left">
          <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
            AI Logic Router
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 font-semibold">Gemini Flash</span>
          </p>
          <p className="text-[10px] text-slate-400 font-mono">Processed in 34ms · Branch #A</p>
        </div>
      </div>

      {/* Top Header & Brand Wordmark */}
      <div className="flex flex-col items-center mb-6 relative z-10 animate-fade-up">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 group-hover:shadow-brand-500/40 transition-all duration-300">
            <Flame className="w-6 h-6 fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
              AutomateX
            </span>
          </div>
        </Link>
        <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200/60 text-[10px] font-semibold text-brand-700 tracking-wide uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Zero-Latency DAG Engine v2.4
        </div>
      </div>

      {/* Auth Card */}
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-3xl p-7 sm:p-9 border border-slate-200/90 shadow-2xl shadow-slate-900/5 relative z-10 transition-all duration-300 animate-fade-up">
        
        {/* Card Heading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in to AutomateX
          </h1>
          <p className="text-xs text-slate-500 mt-1.5">
            Welcome back — orchestrate your automated workflows.
          </p>
        </div>

        {/* 1-Click Demo Helper Strip */}
        <div className="mb-6 p-3 rounded-2xl bg-gradient-to-r from-orange-50/80 via-amber-50/80 to-orange-50/80 border border-orange-200/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 fill-brand-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-800">Reviewing or Exploring?</p>
              <p className="text-[10px] text-slate-500">Auto-fill test demo credentials instantly</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-orange-500 hover:text-white border border-orange-300/80 text-[11px] font-bold text-brand-700 shadow-sm transition-all duration-150 shrink-0 active:scale-95 flex items-center gap-1"
          >
            <Play className="w-3 h-3 fill-current" />
            Fill Demo
          </button>
        </div>

        {/* Social SSO Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => handleSocialMock('Google')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:border-slate-300 hover:shadow active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.67v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.16z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.24v3.13C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.26A7.11 7.11 0 0 1 4.9 12c0-.79.14-1.57.38-2.26V6.61H1.24A11.97 11.97 0 0 0 0 12c0 1.92.45 3.74 1.24 5.39l4.04-3.13z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.61l4.04 3.13c.95-2.84 3.6-4.99 6.72-4.99z"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialMock('GitHub')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:border-slate-300 hover:shadow active:scale-[0.98]"
          >
            <svg className="w-4 h-4 fill-slate-800" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider relative">
            Or sign in with email
          </span>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Email address
            </label>
            <div className="relative group">
              <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-brand-500 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
              <input
                type="email"
                placeholder="you@company.com"
                autoComplete="username"
                className={`w-full bg-slate-50/70 border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 transition-all ${
                  errors.email
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-slate-200 focus:border-brand-500'
                }`}
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address',
                  },
                })}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] text-brand-600 hover:text-brand-700 font-medium hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative group">
              <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-brand-500 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                className={`w-full bg-slate-50/70 border rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 transition-all ${
                  errors.password
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-slate-200 focus:border-brand-500'
                }`}
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Caps Lock Indicator */}
            {capsLockActive && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-medium animate-fade-in">
                <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                <span>Caps Lock is ON</span>
              </div>
            )}

            {errors.password && (
              <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember me option */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 focus:ring-offset-0 cursor-pointer accent-brand-500"
              />
              <span className="text-xs text-slate-600">Remember this device for 30 days</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all duration-200 shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/35 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer btn-shimmer-sweep"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying credentials…</span>
              </div>
            ) : (
              <>
                <span>Sign In to Platform</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch to Register */}
        <p className="text-center text-xs text-slate-500 mt-6 pt-5 border-t border-slate-100">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-brand-600 hover:text-brand-700 font-bold transition-colors inline-flex items-center gap-1 hover:underline"
          >
            Create one free
            <ArrowRight className="w-3 h-3" />
          </Link>
        </p>
      </div>

      {/* Trust & Security Verification Bar */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-slate-500 text-[11px] relative z-10 select-none">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-bit Encrypted Vault</span>
        </div>
        <span className="text-slate-300 hidden sm:inline">•</span>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>10ms Execution Engine</span>
        </div>
        <span className="text-slate-300 hidden sm:inline">•</span>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
          <span>SOC-2 Type II Certified</span>
        </div>
      </div>
    </div>
  );
};
