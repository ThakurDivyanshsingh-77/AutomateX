import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Flame, LogOut, Menu, X, Plus, Sparkles, Shield, User, ExternalLink, Activity } from 'lucide-react';

export const Navbar = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 select-none shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      {/* Left: Mobile Toggle + Logo + Status Pill */}
      <div className="flex items-center gap-3 md:gap-4">
        {isAuthenticated && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white shadow-glow-brand group-hover:scale-105 transition-transform duration-200">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-white group-hover:text-brand-400 transition-colors">
              AutomateX
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-medium bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded-full border border-brand-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              v1.4 Live
            </span>
          </div>
        </Link>
      </div>

      {/* Right: Actions & User Info */}
      <div className="flex items-center gap-3 md:gap-4">
        {isAuthenticated && (
          <div className="hidden lg:flex items-center gap-2">
            <Link
              to="/ai-builder"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>AI Prompt Builder</span>
            </Link>

            <Link
              to="/workflows/create"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 transition-all shadow-glow-brand hover:scale-[1.02]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Flow</span>
            </Link>
          </div>
        )}

        {isAuthenticated && user ? (
          <div className="flex items-center gap-2 md:gap-3 pl-2 border-l border-slate-800">
            <button
              onClick={() => navigate('/profile')}
              className={`flex items-center gap-2.5 text-xs font-medium px-2.5 py-1.5 rounded-xl transition-all ${
                location.pathname === '/profile'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-brand-600/30 to-indigo-600/30 border border-brand-500/30 flex items-center justify-center text-brand-300 font-bold text-xs shadow-sm">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-semibold text-slate-200 text-xs leading-none">
                  {user.name || 'User'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 leading-none">
                  {user.role || 'Admin'}
                </span>
              </div>
            </button>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all flex items-center gap-1 text-xs"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 px-4 py-2 rounded-xl transition-all shadow-glow-brand"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};


