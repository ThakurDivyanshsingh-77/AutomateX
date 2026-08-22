import React, { useState } from 'react';
import { Cookie, CheckCircle2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export function CookiesPage() {
  const [preferences, setPreferences] = useState({
    necessary: true,
    performance: true,
    functional: true,
    analytics: false,
  });

  const handleSave = () => {
    toast.success('Cookie preferences updated and saved!');
  };

  return (
    <div className="py-16 md:py-24 px-5 sm:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12 border-b border-cream-border pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
          style={{ background: '#fff2ec', color: '#ff4f00', borderColor: '#ffd8c7' }}>
          <Cookie className="w-3.5 h-3.5" /> Cookie Policy
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink mb-4" style={{ color: '#1A1012' }}>
          Cookie Policy & Preferences
        </h1>
        <p className="text-sm text-gray-500">Last updated: August 20, 2026</p>
      </div>

      {/* Content */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-cream-border shadow-xs space-y-8 text-sm text-ink-body">
        <p className="leading-relaxed">
          We use cookies and local storage tokens to keep you securely signed in, preserve your visual canvas zoom/pan settings, and measure platform latency. You have full control over your cookie preferences below:
        </p>

        {/* Preferences Toggles */}
        <div className="space-y-4 border-t border-b border-cream-border py-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-cream-soft">
            <div>
              <div className="font-bold text-ink text-sm">Strictly Necessary Cookies (Required)</div>
              <div className="text-xs text-gray-500 mt-0.5">JWT authentication tokens, CSRF protection, and session persistence.</div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-gray-200 text-gray-700">Always Active</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-cream-soft">
            <div>
              <div className="font-bold text-ink text-sm">Canvas & Workspace Preferences</div>
              <div className="text-xs text-gray-500 mt-0.5">Remembers sidebar collapse state, dark/light theme, and node canvas coordinates.</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.functional}
              onChange={e => setPreferences({ ...preferences, functional: e.target.checked })}
              className="w-5 h-5 accent-orange-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-cream-soft">
            <div>
              <div className="font-bold text-ink text-sm">Performance & Error Telemetry</div>
              <div className="text-xs text-gray-500 mt-0.5">Anonymous telemetry to identify JavaScript runtime errors and slow API endpoints.</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.performance}
              onChange={e => setPreferences({ ...preferences, performance: e.target.checked })}
              className="w-5 h-5 accent-orange-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-cream-soft">
            <div>
              <div className="font-bold text-ink text-sm">Anonymous Analytics</div>
              <div className="text-xs text-gray-500 mt-0.5">Helps us understand which documentation guides and integration connectors are most popular.</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.analytics}
              onChange={e => setPreferences({ ...preferences, analytics: e.target.checked })}
              className="w-5 h-5 accent-orange-500 cursor-pointer"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-3 rounded-xl font-bold text-sm bg-orange-500 text-white hover:bg-orange-600 shadow-md transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Cookie Preferences
        </button>
      </div>
    </div>
  );
}

export default CookiesPage;
