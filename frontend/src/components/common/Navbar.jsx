import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Flame, LogOut, Menu, X, Plus, Sparkles, Shield, User, ExternalLink, Activity } from 'lucide-react';

export const Navbar = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="h-16 border-b border-slate-200/90 bg-white/90 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 select-none shadow-sm text-slate-900">
      {/* Left: Mobile Toggle + Logo + Status Pill */}
      <div className="flex items-center gap-3 md:gap-4">
        {isAuthenticated && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
              AutomateX
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-full border border-orange-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
              <span>AI Prompt Builder</span>
            </Link>

            <Link
              to="/workflows/create"
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 transition-all shadow-md shadow-brand-500/20 hover:scale-[1.02]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Flow</span>
            </Link>
          </div>
        )}

        {isAuthenticated && user ? (
          <div className="flex items-center gap-2 md:gap-3 pl-2 border-l border-slate-200">
            <button
              onClick={() => navigate('/profile')}
              className={`flex items-center gap-2.5 text-xs font-medium px-2.5 py-1.5 rounded-xl transition-all ${
                location.pathname === '/profile'
                  ? 'bg-slate-100 text-slate-900 border border-slate-300 shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-brand-500/20 to-orange-500/20 border border-brand-500/30 flex items-center justify-center text-brand-700 font-bold text-xs shadow-sm">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-bold text-slate-800 text-xs leading-none">
                  {user.name || 'User'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 leading-none capitalize">
                  {user.role || 'Admin'}
                </span>
              </div>
            </button>

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-colors shadow-md shadow-brand-500/20"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
