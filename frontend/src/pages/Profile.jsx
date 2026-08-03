import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, Mail, Shield, Calendar, CheckCircle2, Edit3, Key, Upload } from 'lucide-react';

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
    <div className="max-w-3xl mx-auto space-y-6 select-none font-sans">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">User Profile</h1>
        <p className="text-xs text-slate-400">View your account details and authentication state</p>
      </div>

      <Card className="space-y-6">
        {/* Profile Card Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-2xl">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <button
                disabled
                title="Upload Avatar (Coming soon)"
                className="absolute -bottom-1 -right-1 p-1.5 bg-slate-800 text-slate-500 rounded-lg border border-slate-700 cursor-not-allowed"
              >
                <Upload className="w-3 h-3" />
              </button>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {user?.name || 'Divyansh'}
                <CheckCircle2 className="w-4 h-4 text-emerald-400" title="Verified User" />
              </h2>
              <span className="text-xs font-mono text-slate-400">{user?.email}</span>
            </div>
          </div>

          <Button variant="secondary" size="sm" disabled title="Profile editing coming soon">
            <Edit3 className="w-3.5 h-3.5" /> Edit Profile
          </Button>
        </div>

        {/* Profile Details List */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-slate-400">Full Name</span>
            </div>
            <span className="text-xs font-semibold text-white">{user?.name || 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-slate-400">Email Address</span>
            </div>
            <span className="text-xs font-semibold text-white font-mono">{user?.email || 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-slate-400">Account Role</span>
            </div>
            <span className="text-xs font-semibold text-white capitalize bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
              {user?.role || 'user'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-slate-400">Account Created</span>
            </div>
            <span className="text-xs font-semibold text-white">{formattedDate}</span>
          </div>
        </div>

        {/* Future Actions Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Security Options</span>
          <Button variant="ghost" size="sm" disabled className="text-slate-500 cursor-not-allowed">
            <Key className="w-3.5 h-3.5" /> Change Password (Disabled)
          </Button>
        </div>
      </Card>
    </div>
  );
};
