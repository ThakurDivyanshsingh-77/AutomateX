import React, { useState } from 'react';
import { Sparkles, Calendar, Tag, ArrowUpRight, CheckCircle2, Shield, RefreshCw, Zap, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const RELEASES = [
  {
    version: 'v2.4.0',
    date: 'August 2026',
    title: 'Autonomous AI Workflow Orchestrator & Claude 3.5 Sonnet Integration',
    badge: 'Major Release',
    highlights: [
      'Natural language prompt-to-workflow synthesis engine with auto-branching',
      'Native support for Claude 3.5 Sonnet, GPT-4o, and Gemini 1.5 Pro reasoning nodes',
      'Dynamic JSON output schema enforcement with automated repair loops',
      'Sub-millisecond node-level token tracking and budget guardrails',
    ],
    improvements: [
      'Upgraded React Flow canvas rendering speed by 4x on 200+ node workflows',
      'Enhanced Handlebars expression autocomplete in JSON payload editor',
    ],
    fixes: [
      'Fixed edge reconnection glitch when duplicating nested conditional blocks',
      'Resolved race condition in Redis pub/sub execution status broadcast',
    ],
  },
  {
    version: 'v2.3.0',
    date: 'July 2026',
    title: 'Dead Letter Queue (DLQ), Auto-Retries & Time-Travel Debugger',
    badge: 'Reliability',
    highlights: [
      'Enterprise-grade Dead Letter Queue (DLQ) with automatic payload preservation',
      'Configurable exponential backoff retry policies per node with jitter',
      'One-click execution replay from point of failure without re-running entire pipeline',
      'Step-by-step state snapshot inspector with visual data diffing',
    ],
    improvements: [
      'Execution log ingestion latency dropped below 15ms via buffered batch streaming',
      'Added automated Slack and Webhook alerts for failed execution thresholds',
    ],
    fixes: [
      'Fixed timestamp formatting in execution audit table for UTC+0 timezones',
    ],
  },
  {
    version: 'v2.2.0',
    date: 'June 2026',
    title: 'AES-256 OAuth 2.0 Credential Vault & Role-Based Access Control',
    badge: 'Security',
    highlights: [
      'Zero-trust AES-256 GCM encrypted credential storage with rotating KMS keys',
      'Automated OAuth token refresh loops for Slack, GitHub, Google, and HubSpot',
      'Workspace-level Role-Based Access Control (Admin, Editor, Viewer)',
    ],
    improvements: [
      'Granular audit logging for every credential usage event',
      'Self-serve credential revocation and scope limitation drawer',
    ],
    fixes: [
      'Resolved refresh token expiration edge case during concurrent trigger runs',
    ],
  },
  {
    version: 'v2.0.0',
    date: 'May 2026',
    title: 'AutomateX 2.0: Modular Node Engine & Full Canvas Redesign',
    badge: 'Milestone',
    highlights: [
      'Complete rewrite of the workflow execution engine in high-performance Node.js',
      'New Zapier-inspired warm aesthetic with dark mode and high-contrast nodes',
      '100+ native connectors spanning AI, databases, DevOps, and communication tools',
      'Custom JavaScript sandbox node with full NPM library support',
    ],
    improvements: [
      'Zero-configuration webhook URL generation with instantaneous SSL certs',
    ],
    fixes: [
      'Initial public release',
    ],
  },
];

export function ChangelogPage() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Subscribed! You will receive weekly changelog updates.');
    setEmail('');
  };

  return (
    <div className="py-16 md:py-24 px-5 sm:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
          style={{ background: '#fff2ec', color: '#ff4f00', borderColor: '#ffd8c7' }}>
          <Sparkles className="w-3.5 h-3.5" /> What's New in AutomateX
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-ink mb-4" style={{ color: '#1A1012' }}>
          Product Changelog & Updates
        </h1>
        <p className="text-base sm:text-lg text-ink-body mb-8" style={{ color: '#5C5050' }}>
          We ship new features, optimizations, and connectors every week. Track our platform evolution here.
        </p>

        {/* Subscribe banner */}
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your work email..."
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-white"
            required
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-sm bg-orange-500 text-white hover:bg-orange-600 shrink-0 transition-colors flex items-center justify-center gap-2"
          >
            <Bell className="w-4 h-4" /> Subscribe
          </button>
        </form>
      </div>

      {/* Timeline Releases */}
      <div className="space-y-12 relative before:absolute before:inset-0 before:left-3 sm:before:left-6 before:w-0.5 before:bg-cream-border">
        {RELEASES.map((rel, idx) => (
          <div key={idx} className="relative flex items-start gap-4 sm:gap-8 pl-8 sm:pl-14">
            {/* Timeline node */}
            <div className="absolute left-1.5 sm:left-4.5 top-1.5 w-3.5 h-3.5 rounded-full bg-orange-500 ring-4 ring-orange-100 shrink-0" />

            {/* Release Card */}
            <div className="w-full bg-white border border-cream-border rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold px-2.5 py-1 rounded-lg bg-ink text-white">
                    {rel.version}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
                    {rel.badge}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{rel.date}</span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-ink mb-4">
                {rel.title}
              </h2>

              {/* Highlights */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-3 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Key Capabilities
                </h3>
                <ul className="space-y-2">
                  {rel.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-ink-body">
                      <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements & Fixes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-cream-border pt-4 text-xs">
                <div>
                  <h4 className="font-bold text-ink mb-2">⚡ Improvements</h4>
                  <ul className="space-y-1.5 text-ink-body">
                    {rel.improvements.map((imp, i) => (
                      <li key={i}>• {imp}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-ink mb-2">🛠️ Fixes & Polish</h4>
                  <ul className="space-y-1.5 text-ink-body">
                    {rel.fixes.map((fix, i) => (
                      <li key={i}>• {fix}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChangelogPage;
