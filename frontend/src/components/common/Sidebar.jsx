import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, GitFork, Activity, ShieldCheck, Layers, Settings, Lock, AlertOctagon, Sparkles } from 'lucide-react';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const activeNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Workflows', path: '/workflows', icon: GitFork },
    { name: 'AI Builder', path: '/ai-builder', icon: Sparkles },
    { name: 'Execution History', path: '/executions', icon: Activity },
    { name: 'Reliability Engine', path: '/reliability', icon: AlertOctagon },
    { name: 'Credentials Vault', path: '/credentials', icon: ShieldCheck },
    { name: 'Templates', path: '/templates', icon: Layers },
    { name: 'User Profile', path: '/profile', icon: User },
  ];

  const disabledNavItems = [
    { name: 'Settings', icon: Settings, badge: 'Coming Soon' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full p-4 select-none justify-between bg-white">
      <div className="space-y-4">
        <div>
          <h4 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider px-3 mb-2">
            Main Navigation
          </h4>
          <div className="space-y-1">
            {activeNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-orange-50 text-orange-600 border border-orange-200/80 shadow-sm font-bold'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider px-3 mb-2">
            Upcoming Modules
          </h4>
          <div className="space-y-1">
            {disabledNavItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-stone-400 bg-stone-50 border border-stone-100 cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 opacity-50" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[9px] font-mono font-normal px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 border border-stone-200">
                    {item.badge}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100 text-[11px] text-stone-600 space-y-1">
        <div className="flex items-center gap-1.5 text-stone-800 font-semibold">
          <Lock className="w-3.5 h-3.5 text-orange-500" /> Platform Status
        </div>
        <p className="text-[10px] leading-relaxed text-stone-500">
          DAG Engine & Realtime Logs Active.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-60 bg-white border-r border-stone-200/90 flex-col h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <aside className="relative w-64 bg-white border-r border-stone-200 h-full shadow-2xl z-10">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

