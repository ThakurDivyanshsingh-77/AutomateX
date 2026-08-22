import React, { useState } from 'react';
import { CheckCircle2, ShieldAlert, Activity, Server, Clock, ArrowUpRight, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const SERVICES = [
  {
    name: 'Workflow Execution Engine',
    status: 'Operational',
    uptime: '99.99%',
    latency: '32ms',
    description: 'Core V8/Pyodide node runner and distributed execution scheduler.',
  },
  {
    name: 'Webhook Ingestion Gateway',
    status: 'Operational',
    uptime: '100%',
    latency: '18ms',
    description: 'High-throughput edge listeners with cryptographic HMAC validation.',
  },
  {
    name: 'Dead Letter Queue (DLQ) & Redis Workers',
    status: 'Operational',
    uptime: '99.98%',
    latency: '12ms',
    description: 'Distributed BullMQ / Redis job queue and auto-retry broker.',
  },
  {
    name: 'AES-256 OAuth Vault & KMS',
    status: 'Operational',
    uptime: '100%',
    latency: '24ms',
    description: 'Zero-knowledge token encryption, refresh workers, and secrets storage.',
  },
  {
    name: 'AI Model Gateway (GPT-4o, Claude, Gemini)',
    status: 'Operational',
    uptime: '99.95%',
    latency: '145ms',
    description: 'Multi-LLM router, schema auto-repair, and rate limit orchestrator.',
  },
  {
    name: 'Real-time WebSocket Push Engine',
    status: 'Operational',
    uptime: '99.99%',
    latency: '9ms',
    description: 'Sub-millisecond live canvas telemetry and execution state streaming.',
  },
];

const INCIDENTS = [
  {
    date: 'August 14, 2026',
    title: 'Scheduled Maintenance: Database Cluster Minor Upgrade',
    status: 'Resolved',
    duration: '12 minutes',
    description: 'Seamless database failover completed without dropped webhook events or execution failures.',
  },
  {
    date: 'July 28, 2026',
    title: 'Upstream Provider Rate Limit Transient Delay',
    status: 'Resolved',
    duration: '6 minutes',
    description: 'Upstream OpenAI API timeout spiked error rates. AutomateX DLQ automatically preserved and re-executed all affected workflows with zero data loss.',
  },
];

export function StatusPage() {
  const [subModal, setSubModal] = useState(false);
  const [subEmail, setSubEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!subEmail) return;
    toast.success('Subscribed! You will receive incident alerts.');
    setSubModal(false);
    setSubEmail('');
  };

  return (
    <div className="py-16 md:py-24 px-5 sm:px-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Live System Status
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink" style={{ color: '#1A1012' }}>
            AutomateX Platform Health
          </h1>
        </div>

        <button
          onClick={() => setSubModal(true)}
          className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-ink text-white hover:bg-ink-soft flex items-center gap-2 transition-colors shrink-0"
        >
          <Bell className="w-4 h-4 text-orange-400" /> Subscribe to Updates
        </button>
      </div>

      {/* Main Status Hero Card */}
      <div className="rounded-3xl p-6 sm:p-8 bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-5 mb-12">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-emerald-950">
            All Systems Fully Operational
          </h2>
          <p className="text-xs sm:text-sm text-emerald-800 mt-1">
            Global 90-day platform uptime is <span className="font-bold">99.992%</span>. All webhook endpoints, execution clusters, and LLM routers are healthy.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <div className="p-5 rounded-2xl border border-cream-border bg-white">
          <div className="text-xs text-gray-500 font-medium mb-1">Average Webhook Response</div>
          <div className="text-2xl font-black text-ink">18 ms</div>
          <div className="text-xs text-emerald-600 mt-1">✓ Edge CDN Accelerated</div>
        </div>
        <div className="p-5 rounded-2xl border border-cream-border bg-white">
          <div className="text-xs text-gray-500 font-medium mb-1">Execution Engine Latency</div>
          <div className="text-2xl font-black text-ink">32 ms</div>
          <div className="text-xs text-emerald-600 mt-1">✓ 0.00% Error Rate</div>
        </div>
        <div className="p-5 rounded-2xl border border-cream-border bg-white">
          <div className="text-xs text-gray-500 font-medium mb-1">Dead Letter Recovery Rate</div>
          <div className="text-2xl font-black text-ink">100.0%</div>
          <div className="text-xs text-emerald-600 mt-1">✓ 0 Dropped Payloads</div>
        </div>
      </div>

      {/* Services Breakdown */}
      <div className="mb-16">
        <h3 className="text-xl font-bold text-ink mb-4">Core Infrastructure Components</h3>
        <div className="border border-cream-border rounded-2xl bg-white divide-y divide-cream-border overflow-hidden shadow-xs">
          {SERVICES.map((srv, i) => (
            <div key={i} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-cream-soft/30 transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-ink">{srv.name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {srv.status}
                  </span>
                </div>
                <p className="text-xs text-ink-body mt-1">{srv.description}</p>
              </div>

              <div className="flex items-center gap-6 sm:shrink-0 text-xs">
                <div>
                  <div className="text-gray-400 font-medium">Uptime (90d)</div>
                  <div className="font-bold text-ink">{srv.uptime}</div>
                </div>
                <div>
                  <div className="text-gray-400 font-medium">Latency</div>
                  <div className="font-bold text-ink">{srv.latency}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past Incidents */}
      <div>
        <h3 className="text-xl font-bold text-ink mb-4">Incident & Maintenance History (Past 90 Days)</h3>
        <div className="space-y-4">
          {INCIDENTS.map((inc, i) => (
            <div key={i} className="p-6 rounded-2xl border border-cream-border bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-gray-500">{inc.date}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                  {inc.status} ({inc.duration})
                </span>
              </div>
              <h4 className="font-bold text-ink text-base mb-1">{inc.title}</h4>
              <p className="text-xs text-ink-body leading-relaxed">{inc.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for subscribe */}
      {subModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-cream-border shadow-2xl">
            <h4 className="text-lg font-bold text-ink mb-2">Get Automated Status Alerts</h4>
            <p className="text-xs text-ink-body mb-4">
              Receive instant email notifications whenever an incident is reported, updated, or resolved.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                placeholder="developer@company.com"
                value={subEmail}
                onChange={e => setSubEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-white"
                required
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-orange-500 text-white hover:bg-orange-600"
                >
                  Subscribe to Alerts
                </button>
                <button
                  type="button"
                  onClick={() => setSubModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-cream-border text-ink hover:bg-cream"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatusPage;
