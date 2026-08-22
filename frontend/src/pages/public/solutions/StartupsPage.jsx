import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Sparkles, DollarSign, Zap, CheckCircle2, ArrowRight, Gift } from 'lucide-react';
import toast from 'react-hot-toast';

export function StartupsPage() {
  const [applied, setApplied] = useState(false);
  const [startupName, setStartupName] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');

  const handleApply = (e) => {
    e.preventDefault();
    if (!startupName || !email) return;
    toast.success('Application submitted! Our startup team will review within 24 hours.');
    setApplied(true);
  };

  return (
    <div className="py-16 md:py-24 px-5 sm:px-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
          style={{ background: '#fff2ec', color: '#ff4f00', borderColor: '#ffd8c7' }}>
          <Rocket className="w-3.5 h-3.5" /> AutomateX for Startups
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink mb-6" style={{ color: '#1A1012' }}>
          Ship products 10x faster with <span style={{ color: '#ff4f00' }}>zero backend bloat</span>
        </h1>
        <p className="text-lg text-ink-body max-w-2xl mx-auto" style={{ color: '#5C5050' }}>
          Stop writing redundant cron jobs and webhook handlers. Automate user onboarding, payment alerts, and AI features in minutes.
        </p>
      </div>

      {/* Startup Perks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="p-8 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
            <Gift className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-ink mb-3">$10,000 in Platform Credits</h3>
          <p className="text-sm text-ink-body leading-relaxed">
            Get up to 1 year of free AutomateX Pro/Team execution capacity to scale from day 1 without worrying about infrastructure bills.
          </p>
        </div>

        <div className="p-8 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-ink mb-3">AI-Powered Rapid Prototyping</h3>
          <p className="text-sm text-ink-body leading-relaxed">
            Generate complete complex business logic pipelines just by prompting our AI builder. Iterate on MVPs in hours instead of weeks.
          </p>
        </div>

        <div className="p-8 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-ink mb-3">1-on-1 Architect Onboarding</h3>
          <p className="text-sm text-ink-body leading-relaxed">
            Direct access to AutomateX core engineers via private Slack channel for architecture reviews and workflow optimization.
          </p>
        </div>
      </div>

      {/* Startup Credits Application Form */}
      <div className="rounded-3xl border border-cream-border bg-white p-8 sm:p-12 max-w-2xl mx-auto shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-2">Apply for the AutomateX Startup Program</h2>
          <p className="text-xs sm:text-sm text-ink-body">Eligible for bootstrapped or funded startups founded in the last 5 years.</p>
        </div>

        {applied ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-emerald-800">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold">Application Received!</h3>
            <p className="text-xs mt-1">We're reviewing your startup details and will send your credit activation key to {email}.</p>
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">Startup Name</label>
              <input
                type="text"
                placeholder="Acme AI, Inc."
                value={startupName}
                onChange={e => setStartupName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-cream-soft"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">Company Website / App URL</label>
              <input
                type="text"
                placeholder="https://acme.ai"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-cream-soft"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">Work Email</label>
              <input
                type="email"
                placeholder="founder@acme.ai"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-cream-soft"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-orange-500 text-white hover:bg-orange-600 shadow-md transition-all flex items-center justify-center gap-2"
            >
              Submit Application & Claim $10,000 Credits <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default StartupsPage;
