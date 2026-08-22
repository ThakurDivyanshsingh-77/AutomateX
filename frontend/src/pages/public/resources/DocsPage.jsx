import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Search, Code, Cpu, Shield, RefreshCw, Terminal, 
  Copy, Check, ChevronRight, FileText, Sparkles, ExternalLink 
} from 'lucide-react';
import toast from 'react-hot-toast';

const SECTIONS = [
  {
    id: 'quickstart',
    title: 'Quickstart & Installation',
    icon: Sparkles,
    content: {
      headline: 'Quickstart Guide: Building your first workflow in 3 minutes',
      body: `AutomateX is a modern visual workflow automation engine. To create your first workflow, navigate to your dashboard and follow these three simple steps:`,
      steps: [
        { title: '1. Choose a Trigger Node', desc: 'Select Webhook, Schedule (Cron), GitHub event, or Stripe payment trigger.' },
        { title: '2. Connect Action Nodes & Logic', desc: 'Drag wires between nodes to create conditional branches, LLM transformers, or API calls.' },
        { title: '3. Test & Activate', desc: 'Run test payloads through the visual debugger, then toggle the workflow to Active.' }
      ],
      code: `// Sample Webhook Trigger Payload accessible via Handlebars:
// {{steps.trigger.payload.user.email}}
{
  "event": "user.signup",
  "user": {
    "id": "usr_991823",
    "email": "alex@example.com",
    "tier": "enterprise"
  }
}`
    }
  },
  {
    id: 'expressions',
    title: 'Data Mapping & Expressions',
    icon: Code,
    content: {
      headline: 'Dynamic Handlebars Expressions & Variable Interpolation',
      body: `AutomateX uses high-performance Handlebars syntax to dynamically reference data from previous steps in your execution graph.`,
      steps: [
        { title: 'Access Trigger Output', desc: 'Use {{steps.trigger.data}} to reference the original trigger payload.' },
        { title: 'Access Node Steps by ID', desc: 'Use {{steps.node_123.output.result}} to reference step outputs.' },
        { title: 'Built-in Helper Functions', desc: 'Use {{json payload}}, {{upper name}}, {{dateFormat date "YYYY-MM-DD"}}, and {{coalesce a b}}.' }
      ],
      code: `// Example String Template in Slack / Email Node:
Hello {{steps.trigger.payload.user.name}},
Your order #{{steps.trigger.payload.orderId}} of USD {{steps.calculate_total.output.amount}} has succeeded!
Tracking URL: https://track.example.com/{{steps.shipping.output.trackingCode}}`
    }
  },
  {
    id: 'dlq',
    title: 'Dead Letter Queue & Reliability',
    icon: RefreshCw,
    content: {
      headline: 'Enterprise DLQ, Auto-Retries & Exponential Backoff',
      body: `When downstream APIs (like Slack, Stripe, or internal databases) experience transient outages, AutomateX protects your workflows from data loss.`,
      steps: [
        { title: 'Configurable Retry Policies', desc: 'Specify max retry attempts (e.g. 5) with exponential backoff and jitter.' },
        { title: 'Automatic Dead-Letter Capture', desc: 'If retries are exhausted, the execution state is safely parked in the DLQ.' },
        { title: 'Single-Click Replay', desc: 'Re-trigger failed workflows from the point of failure once downstream services recover.' }
      ],
      code: `// Retry Policy Configuration (JSON):
{
  "max_attempts": 5,
  "initial_interval_ms": 1000,
  "backoff_multiplier": 2.0,
  "jitter": true,
  "dlq_on_exhaustion": true
}`
    }
  },
  {
    id: 'security',
    title: 'Credentials Vault & Security',
    icon: Shield,
    content: {
      headline: 'AES-256 GCM Zero-Trust Credential Vault',
      body: `Store API keys, OAuth tokens, and database passwords securely in isolated KMS-encrypted vaults with automated OAuth refresh loops.`,
      steps: [
        { title: 'Zero-Knowledge Storage', desc: 'Keys are encrypted before storage and only decrypted in isolated worker runtimes.' },
        { title: 'Automated OAuth 2.0 Token Refresh', desc: 'AutomateX automatically refreshes expired access tokens before node execution.' },
        { title: 'Granular Workspace RBAC', desc: 'Restrict credential access to specific workflows, users, or environments.' }
      ],
      code: `// Referencing Vault Secrets securely in Custom Code Nodes:
export default async function handle({ payload, env }) {
  const apiKey = env.STRIPE_SECRET_KEY; // Decrypted on-the-fly in sandbox
  // ...
};`
    }
  }
];

export function DocsPage() {
  const [activeSection, setActiveSection] = useState('quickstart');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const currentDoc = SECTIONS.find(s => s.id === activeSection) || SECTIONS[0];

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-12 md:py-16 px-5 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-cream-border pb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-2">
            <BookOpen className="w-4 h-4" /> Developer Documentation
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink" style={{ color: '#1A1012' }}>
            AutomateX Knowledge Base & Guides
          </h1>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documentation..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-white"
          />
        </div>
      </div>

      {/* Main layout with Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-1.5">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 px-3 mb-2">
            Documentation Modules
          </div>
          {SECTIONS.map(s => {
            const Icon = s.icon;
            const active = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                  active
                    ? 'bg-ink text-white shadow-xs'
                    : 'text-ink-body hover:bg-cream-soft hover:text-ink'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-orange-400' : 'text-gray-500'}`} />
                  <span>{s.title}</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`} />
              </button>
            );
          })}

          <div className="pt-6 mt-6 border-t border-cream-border px-3">
            <Link
              to="/api-docs"
              className="flex items-center gap-2 text-xs font-bold text-orange-600 hover:text-orange-700"
            >
              <Terminal className="w-3.5 h-3.5" /> Open API Reference →
            </Link>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 bg-white border border-cream-border rounded-3xl p-6 sm:p-10 shadow-xs">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-4">
            {currentDoc.content.headline}
          </h2>
          <p className="text-base text-ink-body leading-relaxed mb-8">
            {currentDoc.content.body}
          </p>

          <div className="space-y-4 mb-8">
            {currentDoc.content.steps.map((st, i) => (
              <div key={i} className="p-4 rounded-xl bg-cream border border-cream-border">
                <h4 className="font-bold text-sm text-ink mb-1">{st.title}</h4>
                <p className="text-xs text-ink-body">{st.desc}</p>
              </div>
            ))}
          </div>

          {/* Code Block with copy */}
          <div className="rounded-2xl bg-ink text-white p-5 border border-white/10 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <span className="text-xs font-mono text-orange-300 font-semibold">Example Usage</span>
              <button
                onClick={() => handleCopy(currentDoc.content.code)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-white/10 px-2.5 py-1 rounded-md"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="font-mono text-xs text-gray-300 overflow-x-auto leading-relaxed">
              <code>{currentDoc.content.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocsPage;
