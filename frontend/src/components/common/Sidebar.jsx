import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  GitFork,
  Activity,
  ShieldCheck,
  Layers,
  Settings,
  Lock,
  AlertOctagon,
  Sparkles,
  ChevronRight,
  Radio
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const activeNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, badge: null },
    { name: 'Workflows', path: '/workflows', icon: GitFork, badge: null },
    { name: 'AI Builder', path: '/ai-builder', icon: Sparkles, badge: 'New', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    { name: 'Execution History', path: '/executions', icon: Activity, badge: null },
    { name: 'Reliability Engine', path: '/reliability', icon: AlertOctagon, badge: 'DLQ', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { name: 'Credentials Vault', path: '/credentials', icon: ShieldCheck, badge: null },
    { name: 'Templates', path: '/templates', icon: Layers, badge: null },
    { name: 'User Profile', path: '/profile', icon: User, badge: null },
  ];

  const disabledNavItems = [
    { name: 'Audit Logs', icon: Settings, badge: 'Enterprise' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full p-4 select-none justify-between bg-slate-950/75 backdrop-blur-2xl text-slate-200">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between px-3 mb-2.5">
            <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Core Platform
            </h4>
          </div>
          <nav className="space-y-1">
            {activeNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-500/20 to-brand-500/5 text-brand-400 border border-brand-500/30 shadow-[0_0_15px_-3px_rgba(249,115,22,0.2)] font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge ? (
                        <span className={`text-[9px] font-mono font-medium px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      ) : isActive ? (
                        <ChevronRight className="w-3.5 h-3.5 text-brand-400/70" />
                      ) : null}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="flex items-center justify-between px-3 mb-2.5">
            <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Enterprise
            </h4>
          </div>
          <div className="space-y-1">
            {disabledNavItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 bg-slate-900/30 border border-slate-800/40 cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 opacity-50 text-slate-400" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800/70 text-slate-400 border border-slate-700/50">
                    {item.badge}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Engine Status Bottom Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/80 shadow-inner text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Execution Runtime</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-medium">
            Active
          </span>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-400">
          DAG Engine, Webhook Ingestion & Background Workers healthy.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-950/70 border-r border-slate-800/80 flex-col h-[calc(100vh-4rem)] relative z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 bg-slate-950 border-r border-slate-800 h-full shadow-2xl z-10">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};


