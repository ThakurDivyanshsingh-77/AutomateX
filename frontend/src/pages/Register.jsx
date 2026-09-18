import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Flame,
  User,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  Eye,
  EyeOff,
  AlertCircle,
  Activity,
  Cpu,
  Check,
  Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Register = () => {
  const { register: registerAuth, loading } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password', '');
  const confirmPassword = watch('confirmPassword', '');

  // Live Password Strength Calculation
  const passwordCriteria = useMemo(() => {
    return {
      hasLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const strengthScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.hasLength) score += 1;
    if (passwordCriteria.hasUpper) score += 1;
    if (passwordCriteria.hasNumber) score += 1;
    if (passwordCriteria.hasSpecial) score += 1;
    return score;
  }, [passwordCriteria]);

  const strengthLabel = useMemo(() => {
    if (!password) return { text: '', color: 'text-slate-400' };
    switch (strengthScore) {
      case 1:
        return { text: 'Weak', color: 'text-rose-500', barColor: 'bg-rose-500' };
      case 2:
        return { text: 'Fair', color: 'text-amber-500', barColor: 'bg-amber-500' };
      case 3:
        return { text: 'Good', color: 'text-blue-500', barColor: 'bg-blue-500' };
      case 4:
        return { text: 'Strong & Secure', color: 'text-emerald-500', barColor: 'bg-emerald-500' };
      default:
        return { text: '', color: 'text-slate-400', barColor: 'bg-slate-200' };
    }
  }, [password, strengthScore]);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSocialMock = (provider) => {
    toast(`Connecting to ${provider} OAuth signup portal…`, {
      icon: '🚀',
    });
  };

  const onSubmit = async (data) => {
    if (!agreeTerms) {
      toast.error('Please agree to the Terms of Service to continue.');
      return;
    }
    const res = await registerAuth({ name: data.name, email: data.email, password: data.password });
    if (res.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row relative overflow-hidden font-sans selection:bg-brand-500 selection:text-white auth-grid-pattern">
      {/* Ambient background glows */}
      <div className="fixed top-1/4 left-1/4 w-[36rem] h-[36rem] bg-gradient-to-br from-orange-500/10 via-amber-400/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10 animate-auth-orb-1" />
      <div className="fixed bottom-10 right-1/4 w-[34rem] h-[34rem] bg-gradient-to-tl from-brand-600/10 via-rose-500/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10 animate-auth-orb-2" />

      {/* ── Left panel — brand, live workflow simulator, and proof ───────────────────── */}
      <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16 flex-[0_0_500px] xl:flex-[0_0_540px] bg-white/95 backdrop-blur-xl border-r border-slate-200/80 relative z-10 shadow-sm">
        <div className="space-y-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 group-hover:shadow-brand-500/40 transition-all duration-300">
              <Flame className="w-6 h-6 fill-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
              AutomateX
            </span>
          </Link>

          {/* Heading */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[11px] font-bold text-brand-700">
              <Sparkles className="w-3.5 h-3.5 fill-brand-500" />
              <span>Next-Gen Workflow Automation</span>
            </div>
            <h2 className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Automate anything.<br />
              <span className="text-gradient-brand">Ship in minutes.</span>
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md">
              Connect your apps, trigger webhooks, execute branching visual DAGs, and monitor production runs in real-time.
            </p>
          </div>

          {/* ── Live Interactive Pipeline Simulator (Motion Element) ── */}
          <div className="p-5 rounded-3xl bg-slate-950 text-slate-100 border border-slate-800 shadow-2xl relative overflow-hidden">
            {/* Top Pipeline Bar */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80 text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-semibold">Live DAG Execution</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">38ms latency</span>
            </div>

            {/* Pipeline Stage 1: Webhook */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Webhook Trigger</p>
                    <p className="text-[10px] text-slate-400 font-mono">POST /api/v1/event</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800/60 text-emerald-400 font-bold">
                  200 OK
                </span>
              </div>

              {/* Animated Connector 1 */}
              <div className="relative w-0.5 h-5 bg-slate-800 mx-auto overflow-hidden">
                <span className="absolute left-0 w-full h-2 rounded-full bg-orange-500 animate-[dashFlow_1.2s_linear_infinite]" />
              </div>

              {/* Pipeline Stage 2: AI Parser */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">AI Schema Normalizer</p>
                    <p className="text-[10px] text-slate-400 font-mono">Gemini 1.5 Flash · 99.8% match</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-950 border border-violet-800/60 text-violet-300 font-bold">
                  Routed
                </span>
              </div>

              {/* Animated Connector 2 */}
              <div className="relative w-0.5 h-5 bg-slate-800 mx-auto overflow-hidden">
                <span className="absolute left-0 w-full h-2 rounded-full bg-emerald-400 animate-[dashFlow_1.2s_linear_infinite]" />
              </div>

              {/* Pipeline Stage 3: Multi-Sink Dispatch */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Database & Slack Alert</p>
                    <p className="text-[10px] text-slate-400 font-mono">#notifications · PostgreSQL</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800/60 text-emerald-400 font-bold">
                  Synced
                </span>
              </div>
            </div>
          </div>

          {/* Social Proof Quote */}
          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/60">
            <p className="text-xs text-slate-700 italic leading-relaxed">
              "AutomateX replaced 14 fragile cron jobs with a visual, self-healing DAG in under 30 minutes."
            </p>
            <p className="text-[11px] font-bold text-slate-900 mt-2">
              — Platform Lead, FinTech ScaleUp
            </p>
          </div>
        </div>

        {/* Footer Stats & Status */}
        <div className="pt-6 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Enterprise Grade v2.4
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            99.99% Operational Uptime
          </span>
        </div>
      </div>

      {/* ── Right panel — registration form ─────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10">
        {/* Mobile wordmark */}
        <Link to="/" className="flex items-center gap-2.5 mb-6 lg:hidden group">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white shadow-md shadow-brand-500/20">
            <Flame className="w-6 h-6 fill-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">AutomateX</span>
        </Link>

        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl p-7 sm:p-9 rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/5 animate-fade-up">
          <div className="mb-5">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Create your account
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Start building autonomous workflows for free. No credit card required.
            </p>
          </div>

          {/* Social SSO Quick-Signup */}
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

          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider relative">
              Or sign up with email
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Full name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Full name
              </label>
              <div className="relative group">
                <User className="w-4 h-4 text-slate-400 group-focus-within:text-brand-500 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  type="text"
                  placeholder="Divyansh Singh"
                  autoComplete="name"
                  className={`w-full bg-slate-50/70 border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 transition-all ${
                    errors.name ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-200 focus:border-brand-500'
                  }`}
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: { value: 3, message: 'Must be at least 3 characters' },
                    maxLength: { value: 50, message: 'Must be at most 50 characters' },
                  })}
                />
              </div>
              {errors.name && (
                <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Work email address
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-brand-500 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  className={`w-full bg-slate-50/70 border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 transition-all ${
                    errors.email ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-200 focus:border-brand-500'
                  }`}
                  {...register('email', {
                    required: 'Work email is required',
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Please enter a valid email' },
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

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                {strengthLabel.text && (
                  <span className={`text-[11px] font-bold ${strengthLabel.color}`}>
                    {strengthLabel.text}
                  </span>
                )}
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-brand-500 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  className={`w-full bg-slate-50/70 border rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 transition-all ${
                    errors.password ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-200 focus:border-brand-500'
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'At least 8 characters required' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* ── Real-Time Password Strength Meter ── */}
              {password.length > 0 && (
                <div className="space-y-2 pt-1">
                  {/* Segmented Strength Bar */}
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    <div
                      className={`rounded-full transition-all duration-300 ${
                        strengthScore >= 1 ? strengthLabel.barColor : 'bg-slate-200'
                      }`}
                    />
                    <div
                      className={`rounded-full transition-all duration-300 ${
                        strengthScore >= 2 ? strengthLabel.barColor : 'bg-slate-200'
                      }`}
                    />
                    <div
                      className={`rounded-full transition-all duration-300 ${
                        strengthScore >= 3 ? strengthLabel.barColor : 'bg-slate-200'
                      }`}
                    />
                    <div
                      className={`rounded-full transition-all duration-300 ${
                        strengthScore >= 4 ? strengthLabel.barColor : 'bg-slate-200'
                      }`}
                    />
                  </div>

                  {/* Requirements Checklist Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5 text-[10px]">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border transition-colors ${
                        passwordCriteria.hasLength
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      {passwordCriteria.hasLength && <Check className="w-2.5 h-2.5" />}
                      8+ chars
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border transition-colors ${
                        passwordCriteria.hasUpper
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      {passwordCriteria.hasUpper && <Check className="w-2.5 h-2.5" />}
                      Uppercase
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border transition-colors ${
                        passwordCriteria.hasNumber
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      {passwordCriteria.hasNumber && <Check className="w-2.5 h-2.5" />}
                      Number
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border transition-colors ${
                        passwordCriteria.hasSpecial
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      {passwordCriteria.hasSpecial && <Check className="w-2.5 h-2.5" />}
                      Symbol
                    </span>
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Confirm password
                </label>
                {passwordsMatch && (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Passwords match
                  </span>
                )}
                {passwordsMismatch && (
                  <span className="text-[11px] font-medium text-rose-500">
                    Passwords do not match
                  </span>
                )}
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-brand-500 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className={`w-full bg-slate-50/70 border rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 transition-all ${
                    errors.confirmPassword || passwordsMismatch
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                      : passwordsMatch
                      ? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-500'
                      : 'border-slate-200 focus:border-brand-500'
                  }`}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (v) => v === password || 'Passwords do not match',
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms of Service agreement */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 accent-brand-500 cursor-pointer"
                />
                <span className="text-[11px] text-slate-600 leading-tight">
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" className="text-brand-600 hover:underline font-semibold">
                    Terms of Service
                  </Link>{' '}
                  and acknowledge the{' '}
                  <Link to="/privacy" target="_blank" className="text-brand-600 hover:underline font-semibold">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all duration-200 shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/35 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer btn-shimmer-sweep"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Provisioning workspace…</span>
                </div>
              ) : (
                <>
                  <span>Create Free Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-5 pt-4 border-t border-slate-100">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-brand-600 hover:text-brand-700 font-bold transition-colors inline-flex items-center gap-1 hover:underline"
            >
              Sign in
              <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
