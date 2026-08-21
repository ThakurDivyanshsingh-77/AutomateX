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
    <div className="max-w-3xl mx-auto space-y-6 select-none font-sans text-slate-900">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-brand-600" />
          User Profile & Security
        </h1>
        <p className="text-xs text-slate-500 mt-1">View your account details, role permissions, and authentication state</p>
      </div>

      <Card className="space-y-6 bg-white border border-slate-200 shadow-sm">
        {/* Profile Card Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-brand-600 flex items-center justify-center font-bold text-2xl shadow-sm">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {user?.name || 'AutomateX Architect'}
                <CheckCircle2 className="w-4 h-4 text-emerald-600" title="Verified User" />
              </h2>
              <span className="text-xs font-mono text-slate-500">{user?.email}</span>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1.5 shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-brand-500 text-brand-500" /> Pro Tier
          </span>
        </div>

        {/* Profile Details List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-brand-600" />
              <span className="text-xs text-slate-500">Full Name</span>
            </div>
            <span className="text-xs font-semibold text-slate-900">{user?.name || 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-brand-600" />
              <span className="text-xs text-slate-500">Email Address</span>
            </div>
            <span className="text-xs font-semibold text-slate-900 font-mono">{user?.email || 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-brand-600" />
              <span className="text-xs text-slate-500">Account Role</span>
            </div>
            <span className="text-xs font-bold text-emerald-700 capitalize bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-mono">
              {user?.role || 'admin'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span className="text-xs text-slate-500">Account Created</span>
            </div>
            <span className="text-xs font-semibold text-slate-900">{formattedDate}</span>
          </div>
        </div>

        {/* Security Options Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <Key className="w-3.5 h-3.5 text-brand-600" /> Security & 2FA
          </span>
          <span className="text-emerald-700 font-mono text-[11px] font-bold">
            JWT Session Active
          </span>
        </div>
      </Card>
    </div>

  );
};

