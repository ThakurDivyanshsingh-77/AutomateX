import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Zap, User, LogOut, Menu, X, Flame } from 'lucide-react';

export const Navbar = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="h-16 border-b border-stone-200/90 bg-white/95 backdrop-blur px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 select-none shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3">
        {isAuthenticated && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <Link to="/" className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500 text-white shadow-sm">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div>
            <span className="text-base font-bold text-stone-900 tracking-tight">AutomateX</span>
            <span className="ml-2 text-[10px] font-mono font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
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
                  ? 'bg-orange-50 text-orange-700 border border-orange-200'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 font-bold text-[10px]">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span className="hidden sm:inline-block font-semibold">{user.name}</span>
            </button>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-stone-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-1 text-xs font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-stone-700 hover:text-stone-900 px-3 py-1.5 rounded-xl hover:bg-stone-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

