import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Zap, User, LogOut, Menu, X } from 'lucide-react';

export const Navbar = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      <div className="flex items-center gap-3">
        {isAuthenticated && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <Link to="/" className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600/10 border border-indigo-600/20 text-indigo-400">
            <Zap className="w-5 h-5 fill-indigo-400" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">AutomateX</span>
            <span className="ml-2 text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
              SaaS v1.3
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => navigate('/profile')}
              className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-xl transition-colors ${
                location.pathname === '/profile'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-[10px]">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span className="hidden sm:inline-block">{user.name}</span>
            </button>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors flex items-center gap-1 text-xs font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
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
              className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
