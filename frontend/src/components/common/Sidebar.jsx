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
    { name: 'AI Builder', path: '/ai-builder', icon: Sparkles, badge: 'New', badgeColor: 'bg-orange-100 text-orange-700 border-orange-200' },
    { name: 'Execution History', path: '/executions', icon: Activity, badge: null },
    { name: 'Reliability Engine', path: '/reliability', icon: AlertOctagon, badge: 'DLQ', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
    { name: 'Credentials Vault', path: '/credentials', icon: ShieldCheck, badge: null },
    { name: 'Templates', path: '/templates', icon: Layers, badge: null },
    { name: 'User Profile', path: '/profile', icon: User, badge: null },
  ];

  const disabledNavItems = [
    { name: 'Audit Logs', icon: Settings, badge: 'Enterprise' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full p-4 select-none justify-between bg-white border-r border-slate-200 text-slate-800">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between px-3 mb-2.5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                        ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-sm font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-orange-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge ? (
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      ) : isActive ? (
                        <ChevronRight className="w-3.5 h-3.5 text-orange-600" />
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
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Enterprise
            </h4>
          </div>
          <div className="space-y-1">
            {disabledNavItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200/80 cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 opacity-50 text-slate-400" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                    {item.badge}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Engine Status Bottom Card */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            DAG Runtime
          </span>
          <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
            Online
          </span>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-500">
          DAG Engine, Webhooks & Background Workers operational.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col h-[calc(100vh-4rem)] relative z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 bg-white border-r border-slate-200 h-full shadow-2xl z-10">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};



