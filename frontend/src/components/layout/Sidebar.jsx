import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GitFork,
  Terminal,
  ShieldCheck,
  Sparkles,
  User,
  Settings,
  HelpCircle
} from 'lucide-react';

export const Sidebar = ({ isMobile, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Workflows', path: '/workflows', icon: GitFork },
    { label: 'Executions Log', path: '/executions', icon: Terminal },
    { label: 'Credentials Vault', path: '/credentials', icon: ShieldCheck },
    { label: 'Templates Store', path: '/templates', icon: Sparkles },
    { label: 'My Profile', path: '/profile', icon: User },
  ];

  const content = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-64 select-none font-sans">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/10 border border-indigo-600/20 text-indigo-400">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">AutomateX</h1>
            <span className="text-[10px] text-slate-500 font-mono">Enterprise v1.0</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Main Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobile && onClose && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Support Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" /> Docs & API
          </span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
            Online
          </span>
        </div>
      </div>
    </div>
  );

  return content;
};
