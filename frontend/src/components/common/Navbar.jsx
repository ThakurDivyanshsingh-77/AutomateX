import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Zap, User, LogOut, Menu, X, Flame } from 'lucide-react';

export const Navbar = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      <div className="flex items-center gap-3">
        {isAuthenticated && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <Link to="/" className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 shadow-[0_0_15px_rgba(255,79,0,0.15)]">
            <Flame className="w-5 h-5 fill-orange-400 text-orange-400" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">AutomateX</span>
            <span className="ml-2 text-[10px] font-mono bg-orange-500/15 text-orange-300 px-2 py-0.5 rounded-full border border-orange-500/30">
              Enterprise v1.4
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => navigate('/profile')}
              className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-xl transition-all ${
                location.pathname === '/profile'
                  ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30 shadow-[0_0_12px_rgba(255,79,0,0.15)]'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-300 font-bold text-[10px]">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span className="hidden sm:inline-block">{user.name}</span>
            </button>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-zinc-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors flex items-center gap-1 text-xs font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-zinc-300 hover:text-white px-3 py-1.5 rounded-xl hover:bg-zinc-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 px-4 py-2 rounded-xl transition-all shadow-[0_0_20px_rgba(255,79,0,0.35)]"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

