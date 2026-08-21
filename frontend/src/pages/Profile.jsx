import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, Mail, Shield, Calendar, CheckCircle2, Edit3, Key, Upload, Flame, Sparkles } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently';

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-none font-sans text-slate-100">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-brand-400" />
          User Profile & Security
        </h1>
        <p className="text-xs text-slate-400 mt-1">View your account details, role permissions, and authentication state</p>
      </div>

      <Card className="space-y-6 glass-panel border-slate-800/80 shadow-2xl">
        {/* Profile Card Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600/30 to-indigo-600/30 border border-brand-500/30 text-brand-300 flex items-center justify-center font-bold text-2xl shadow-glow-brand">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {user?.name || 'AutomateX Architect'}
                <CheckCircle2 className="w-4 h-4 text-emerald-400" title="Verified User" />
              </h2>
              <span className="text-xs font-mono text-slate-400">{user?.email}</span>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center gap-1.5 shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-brand-500" /> Pro Tier
          </span>
        </div>

        {/* Profile Details List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 glass-panel-subtle border border-slate-800/80 rounded-xl">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-brand-400" />
              <span className="text-xs text-slate-400">Full Name</span>
            </div>
            <span className="text-xs font-semibold text-white">{user?.name || 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 glass-panel-subtle border border-slate-800/80 rounded-xl">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-brand-400" />
              <span className="text-xs text-slate-400">Email Address</span>
            </div>
            <span className="text-xs font-semibold text-white font-mono">{user?.email || 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 glass-panel-subtle border border-slate-800/80 rounded-xl">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-brand-400" />
              <span className="text-xs text-slate-400">Account Role</span>
            </div>
            <span className="text-xs font-semibold text-emerald-400 capitalize bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono">
              {user?.role || 'admin'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 glass-panel-subtle border border-slate-800/80 rounded-xl">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-brand-400" />
              <span className="text-xs text-slate-400">Account Created</span>
            </div>
            <span className="text-xs font-semibold text-white">{formattedDate}</span>
          </div>
        </div>

        {/* Security Options Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Key className="w-3.5 h-3.5 text-brand-400" /> Security & 2FA
          </span>
          <span className="text-emerald-400 font-mono text-[11px]">
            JWT Session Active
          </span>
        </div>
      </Card>
    </div>
  );
};

