import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import {
  User,
  Mail,
  Shield,
  Calendar,
  CheckCircle2,
  Key,
  Flame,
  Lock,
  Activity,
} from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : 'Recently';

  const initials = user?.name
    ? user.name
      .trim()
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
    : 'U';

  return (
    <div className="min-h-full w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 select-none font-sans text-slate-900">

      {/* Page Header */}
      <div className="mb-7">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
            <User className="w-4 h-4 text-orange-600" />
          </div>

          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-950">
            Profile
          </h1>
        </div>

        <p className="text-sm text-slate-500 ml-[42px]">
          Manage your account details, access and security settings.
        </p>
      </div>

      {/* Main Profile Card */}
      <Card className="overflow-hidden !p-0 bg-white border border-slate-200 shadow-sm">

        {/* Profile Hero */}
        <div className="relative px-5 sm:px-7 py-6 sm:py-7 border-b border-slate-100">

          {/* subtle background accent */}
          <div className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-bl from-orange-50/80 to-transparent pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

            {/* User Identity */}
            <div className="flex items-center gap-4">

              {/* Avatar */}
              <div className="relative">
                <div className="w-[68px] h-[68px] rounded-2xl bg-[#fff7ed] border border-orange-200 flex items-center justify-center text-orange-700 font-bold text-xl">
                  {initials}
                </div>

                <div
                  className="absolute -right-1 -bottom-1 w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center"
                  title="Verified account"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-white" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-semibold text-slate-950 truncate">
                    {user?.name || 'AutomateX Architect'}
                  </h2>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-semibold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Verified
                  </span>
                </div>

                <p className="text-sm text-slate-500 mt-0.5 truncate max-w-[280px] sm:max-w-none">
                  {user?.email || 'No email available'}
                </p>
              </div>
            </div>

            {/* Plan */}
            <div className="self-start sm:self-center">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#fff7ed] border border-orange-100">
                <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-wider font-semibold text-orange-500">
                    Current Plan
                  </p>
                  <p className="text-xs font-bold text-orange-700">
                    Pro Tier
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="px-5 sm:px-7 py-6">

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Account information
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Basic information associated with your AutomateX account.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Name */}
            <div className="group flex items-center gap-3.5 p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-colors">
              <div className="w-9 h-9 shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                <User className="w-4 h-4 text-orange-600" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-slate-400 mb-0.5">
                  Full Name
                </p>

                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.name || 'N/A'}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="group flex items-center gap-3.5 p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-colors">
              <div className="w-9 h-9 shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                <Mail className="w-4 h-4 text-orange-600" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-slate-400 mb-0.5">
                  Email Address
                </p>

                <p className="text-sm font-medium text-slate-900 truncate font-mono">
                  {user?.email || 'N/A'}
                </p>
              </div>
            </div>

            {/* Role */}
            <div className="group flex items-center gap-3.5 p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-colors">
              <div className="w-9 h-9 shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                <Shield className="w-4 h-4 text-orange-600" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-slate-400 mb-0.5">
                  Account Role
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900 capitalize">
                    {user?.role || 'admin'}
                  </span>

                  <span className="text-[9px] uppercase tracking-wide font-semibold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                    Access
                  </span>
                </div>
              </div>
            </div>

            {/* Created */}
            <div className="group flex items-center gap-3.5 p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-colors">
              <div className="w-9 h-9 shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-orange-600" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-slate-400 mb-0.5">
                  Account Created
                </p>

                <p className="text-sm font-medium text-slate-900">
                  {formattedDate}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="px-5 sm:px-7 pb-6">

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Security
            </h3>

            <p className="text-xs text-slate-400 mt-0.5">
              Authentication and session status for this account.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden">

            {/* JWT */}
            <div className="flex items-center justify-between gap-4 px-4 py-3.5 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                  <Key className="w-3.5 h-3.5 text-slate-600" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Authentication session
                  </p>

                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Your current JWT session is active.
                  </p>
                </div>
              </div>

              <span className="shrink-0 inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>

            {/* 2FA */}
            <div className="border-t border-slate-200 flex items-center justify-between gap-4 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Two-factor authentication
                  </p>

                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Additional account protection.
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-medium text-slate-500">
                Available
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-slate-400" />

              <span className="text-[10px] text-slate-500">
                Account status
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />

              <span className="text-[10px] font-semibold text-emerald-700">
                All systems operational
              </span>
            </div>

          </div>
        </div>

      </Card>
    </div>
  );
};