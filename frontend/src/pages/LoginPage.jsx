import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, ArrowRight, Loader2, Play } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginAsDemo, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error);
    }
  };

  const handleDemoClick = () => {
    loginAsDemo();
    navigate('/');
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex items-center justify-center p-4 font-sans select-none relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none -top-40 -left-20" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative z-10">
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 mx-auto flex items-center justify-center">
            <Zap className="w-6 h-6 fill-brand-400" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Welcome to AutomateX</h2>
          <p className="text-xs text-slate-400">Sign in to your workflow automation platform</p>
        </div>

        {/* Demo Mode Button */}
        <button
          type="button"
          onClick={handleDemoClick}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition-all transform hover:-translate-y-0.5"
        >
          <Play className="w-4 h-4 fill-white" /> Explore Platform in Instant Demo Mode
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">or continue with email</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              placeholder="engineer@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
