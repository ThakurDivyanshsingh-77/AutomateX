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
    <div className="flex flex-col h-full p-4 select-none justify-between bg-[#0a0a0c]">
      <div className="space-y-4">
        <div>
          <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-3 mb-2">
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
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30 shadow-[0_0_15px_rgba(255,79,0,0.12)]'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/70'
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
          <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-3 mb-2">
            Upcoming Modules
          </h4>
          <div className="space-y-1">
            {disabledNavItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-zinc-600 bg-zinc-950/40 border border-zinc-900 cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 opacity-50" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[9px] font-mono font-normal px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500 border border-zinc-800">
                    {item.badge}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-black border border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
        <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
          <Lock className="w-3.5 h-3.5 text-orange-400" /> Platform Status
        </div>
        <p className="text-[10px] leading-relaxed text-zinc-500">
          DAG Engine & Realtime Logs Active.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-60 bg-[#0a0a0c] border-r border-zinc-800/90 flex-col h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <aside className="relative w-64 bg-[#0a0a0c] border-r border-zinc-800 h-full shadow-2xl z-10">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

