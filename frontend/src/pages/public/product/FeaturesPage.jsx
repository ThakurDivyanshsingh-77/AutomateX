import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, Cpu, Network, ShieldCheck, RefreshCw, Code2, 
  Layers, ArrowRight, CheckCircle2, Sparkles, Play, Database, Lock, Sliders
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Capabilities' },
  { id: 'builder', label: 'Visual Canvas' },
  { id: 'ai', label: 'AI & Intelligence' },
  { id: 'reliability', label: 'Reliability & DLQ' },
  { id: 'security', label: 'Security & Vault' },
];

const FEATURES = [
  {
    category: 'builder',
    icon: Layers,
    title: 'Visual Drag-and-Drop Node Graph',
    badge: 'Canvas 2.0',
    description: 'Design multi-branching execution chains with zero-latency pan/zoom, custom data mappers, and sub-millisecond visual debugging.',
    highlights: ['Multi-output conditional branching', 'Dynamic JSON mapping with Handlebars syntax', 'Sub-millisecond interactive React Flow canvas']
  },
  {
    category: 'ai',
    icon: Sparkles,
    title: 'Autonomous AI Orchestrator',
    badge: 'GPT-4o & Claude 3.5',
    description: 'Transform natural language prompts into production-grade multi-step pipelines. Embed prompt chaining and vector search effortlessly.',
    highlights: ['Multi-LLM router (OpenAI, Anthropic, Gemini)', 'Autonomous loop execution with guardrails', 'Structured JSON extraction & auto-repair']
  },
  {
    category: 'reliability',
    icon: RefreshCw,
    title: 'Dead Letter Queue & Auto-Retry',
    badge: '99.99% Guaranteed',
    description: 'Zero dropped payloads. Automatic exponential backoff retries with jitter, replay queues, and detailed failure diagnostic logs.',
    highlights: ['Automatic Dead-Letter recovery', 'Per-node configurable retry policies', 'Real-time alerting via Slack, Discord, or Webhook']
  },
  {
    category: 'security',
    icon: Lock,
    title: 'AES-256 Encrypted Credential Vault',
    badge: 'Enterprise Grade',
    description: 'Bank-grade isolated secrets storage with automatic OAuth 2.0 token refresh cycles, scoped permissions, and strict audit logging.',
    highlights: ['Zero-trust payload isolation', 'Automatic OAuth token auto-rotation', 'Granular workspace RBAC policies']
  },
  {
    category: 'builder',
    icon: Code2,
    title: 'Custom JavaScript & Python Nodes',
    badge: 'Developer First',
    description: 'Run arbitrary custom code directly inside your workflows with an isolated micro-VM sandbox and full NPM package support.',
    highlights: ['Isolated V8 / Pyodide sandboxing', 'Native fetch and crypto module access', 'Real-time console output stream']
  },
  {
    category: 'reliability',
    icon: Database,
    title: 'Instant Execution History & Time Travel',
    badge: 'Full Observability',
    description: 'Inspect exact step-by-step state snapshots for every single execution. Replay any failed step with single-click precision.',
    highlights: ['Full I/O payload diff inspector', 'Historical state replay', 'High-throughput Redis event streaming']
  }
];

const COMPARISON = [
  { feature: 'Visual Node Canvas', automatex: true, zapier: true, make: true, n8n: true },
  { feature: 'Autonomous AI Prompt-to-Workflow', automatex: true, zapier: false, make: false, n8n: false },
  { feature: 'Native Dead Letter Queue (DLQ)', automatex: true, zapier: false, make: false, n8n: 'Partial' },
  { feature: 'Sub-millisecond Local Debugger', automatex: true, zapier: false, make: false, n8n: true },
  { feature: 'OAuth 2.0 Auto-Refreshing Vault', automatex: true, zapier: true, make: true, n8n: true },
  { feature: 'Custom JS/Python Sandboxing', automatex: true, zapier: 'Limited', make: 'Limited', n8n: true },
  { feature: 'Real-time WebSocket Execution Stream', automatex: true, zapier: false, make: false, n8n: false },
];

export function FeaturesPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeDemoStep, setActiveDemoStep] = useState(1);

  const filteredFeatures = activeCategory === 'all'
    ? FEATURES
    : FEATURES.filter(f => f.category === activeCategory);

  return (
    <div className="py-16 md:py-24 px-5 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
          style={{ background: '#fff2ec', color: '#ff4f00', borderColor: '#ffd8c7' }}>
          <Zap className="w-3.5 h-3.5" /> Next-Gen Automation Platform
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink mb-6" style={{ color: '#1A1012', lineHeight: 1.15 }}>
          Built for speed, power, and <span style={{ color: '#ff4f00' }}>limitless scalability</span>
        </h1>
        <p className="text-lg sm:text-xl text-ink-body max-w-2xl mx-auto" style={{ color: '#5C5050' }}>
          Explore the engine powering mission-critical workflows. From intuitive visual builders to AI agents and self-healing reliability queues.
        </p>
      </div>

      {/* Interactive Feature Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? 'shadow-sm text-white'
                : 'text-ink-body hover:text-ink'
            }`}
            style={{
              backgroundColor: activeCategory === cat.id ? '#ff4f00' : '#EFECEA',
              color: activeCategory === cat.id ? '#ffffff' : '#5C5050',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {filteredFeatures.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="p-7 rounded-2xl border transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
              style={{
                backgroundColor: '#ffffff',
                borderColor: '#E0DDD6',
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fff2ec' }}>
                    <Icon className="w-6 h-6" style={{ color: '#ff4f00' }} />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md" style={{ backgroundColor: '#EFECEA', color: '#1A1012' }}>
                    {feat.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1012' }}>
                  {feat.title}
                </h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: '#5C5050' }}>
                  {feat.description}
                </p>
              </div>

              <div className="border-t pt-4" style={{ borderColor: '#F0ECE1' }}>
                <ul className="space-y-2">
                  {feat.highlights.map((item, hIdx) => (
                    <li key={hIdx} className="flex items-center gap-2 text-xs font-medium" style={{ color: '#3D3030' }}>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Workflow Canvas Simulation */}
      <div className="rounded-3xl p-8 sm:p-12 mb-20 border" style={{ backgroundColor: '#1A1012', borderColor: '#2A1F20' }}>
        <div className="max-w-3xl mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Interactive Preview</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">See the AutomateX engine in motion</h2>
          <p className="text-sm sm:text-base text-gray-400 mt-2">
            Click step nodes to test execution flow, data mapping, and real-time state mutation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {[
            { id: 1, title: '1. Webhook Trigger', desc: 'Receives Stripe payment payload event', status: 'Active' },
            { id: 2, title: '2. AI Reasoning Node', desc: 'GPT-4o analyzes sentiment & classifies tier', status: activeDemoStep >= 2 ? 'Processed' : 'Waiting' },
            { id: 3, title: '3. Multi-Action Dispatch', desc: 'Syncs to Slack, Postgres & HubSpot CRM', status: activeDemoStep >= 3 ? 'Completed' : 'Waiting' },
          ].map(step => (
            <button
              key={step.id}
              onClick={() => setActiveDemoStep(step.id)}
              className={`p-5 rounded-xl border text-left transition-all ${
                activeDemoStep === step.id
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white text-sm">{step.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  activeDemoStep >= step.id ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-gray-400'
                }`}>
                  {step.status}
                </span>
              </div>
              <p className="text-xs text-gray-400">{step.desc}</p>
            </button>
          ))}
        </div>

        <div className="p-4 rounded-xl font-mono text-xs text-emerald-400 bg-black/50 border border-white/10 overflow-x-auto">
          {activeDemoStep === 1 && (
            <code>{`// Ingested Stripe Webhook Event\n{\n  "event": "payment_intent.succeeded",\n  "amount": 49900,\n  "customer": "cus_994021A",\n  "currency": "usd"\n}`}</code>
          )}
          {activeDemoStep === 2 && (
            <code>{`// AI Classification & Node Transform Output\n{\n  "tier": "ENTERPRISE",\n  "sentiment": "high_intent",\n  "priority": 1,\n  "ai_agent_latency_ms": 142\n}`}</code>
          )}
          {activeDemoStep === 3 && (
            <code>{`// Multi-Dispatch Execution Result\n{\n  "postgres_insert": "OK (2ms)",\n  "slack_notification_channel": "#enterprise-wins (12ms)",\n  "hubspot_deal_created": "deal_8820 (34ms)",\n  "status": "ALL_BRANCHES_SUCCEEDED"\n}`}</code>
          )}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-ink mb-3">How AutomateX compares</h2>
          <p className="text-ink-body text-sm max-w-xl mx-auto">Compare core architectural capabilities side-by-side.</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-cream-border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#EFECEA] border-b border-cream-border text-ink">
              <tr>
                <th className="p-4 font-bold">Platform Capability</th>
                <th className="p-4 font-bold text-orange-600 bg-orange-50/50">AutomateX</th>
                <th className="p-4 font-semibold text-gray-600">Zapier</th>
                <th className="p-4 font-semibold text-gray-600">Make</th>
                <th className="p-4 font-semibold text-gray-600">n8n</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-border">
              {COMPARISON.map((row, i) => (
                <tr key={i} className="hover:bg-cream-soft/50 transition-colors">
                  <td className="p-4 font-medium text-ink">{row.feature}</td>
                  <td className="p-4 font-bold text-emerald-600 bg-orange-50/30">
                    <CheckCircle2 className="w-5 h-5 text-orange-600" />
                  </td>
                  <td className="p-4 text-gray-600">
                    {row.zapier === true ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : row.zapier === false ? <span className="text-gray-400">—</span> : row.zapier}
                  </td>
                  <td className="p-4 text-gray-600">
                    {row.make === true ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : row.make === false ? <span className="text-gray-400">—</span> : row.make}
                  </td>
                  <td className="p-4 text-gray-600">
                    {row.n8n === true ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : row.n8n === false ? <span className="text-gray-400">—</span> : row.n8n}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #ff4f00 0%, #d83d00 100%)' }}>
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Ready to automate your engineering stack?</h2>
        <p className="text-orange-100 max-w-xl mx-auto mb-8 text-base">
          Start building custom workflows for free with zero setup. No credit card required.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-3.5 rounded-xl font-bold bg-white text-orange-600 hover:bg-orange-50 shadow-md transition-all flex items-center gap-2"
          >
            Start Free Forever <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/pricing"
            className="px-6 py-3.5 rounded-xl font-bold bg-orange-700/40 text-white hover:bg-orange-700/60 border border-white/20 transition-all"
          >
            View Pricing Plans
          </Link>
        </div>
      </div>
    </div>
  );
}

export default FeaturesPage;
