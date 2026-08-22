import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Clock, BookOpen, ArrowRight, Sparkles, CheckCircle2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const GUIDES = [
  {
    title: 'Autonomous AI Lead Enrichment & Slack Routing with GPT-4o',
    difficulty: 'Intermediate',
    time: '8 min read',
    category: 'AI & Sales Ops',
    description: 'Learn how to ingest raw webhook leads, use OpenAI to enrich company size/industry, and dispatch high-priority alerts into specific team channels.',
    steps: [
      'Set up an incoming HTTP Webhook trigger from your signup form',
      'Pass the email domain to GPT-4o reasoning node to query company firmographics',
      'Add a Conditional Filter: if employee_count > 50 -> #enterprise-sales else #self-serve',
      'Format rich Slack Block Kit notifications with one-click CRM buttons'
    ]
  },
  {
    title: 'Building Zero-Loss Workflows with Dead Letter Queue (DLQ)',
    difficulty: 'Advanced',
    time: '12 min read',
    category: 'Reliability & DevOps',
    description: 'A deep architectural guide on setting up exponential backoff policies, dead-letter recovery queues, and automated incident alerting.',
    steps: [
      'Configure node-level retry policies with randomized jitter',
      'Inspect failed execution payloads inside the DLQ inspector',
      'Set up dead-letter threshold notifications via PagerDuty / Discord',
      'Replay failed payloads from point of failure without duplicate side-effects'
    ]
  },
  {
    title: 'Automated GitHub PR AI Code Reviewer & Security Scanner',
    difficulty: 'Intermediate',
    time: '6 min read',
    category: 'Developer Tools',
    description: 'Trigger automated code quality summaries and dependency vulnerability scans whenever a pull request is opened on GitHub.',
    steps: [
      'Connect GitHub repository webhook with `pull_request.opened` event filter',
      'Fetch PR diff patch files using the native GitHub action node',
      'Send diff chunks to Claude 3.5 Sonnet with custom prompt instructions',
      'Post clean markdown review comments directly back to the pull request'
    ]
  },
  {
    title: 'Syncing Stripe Subscriptions to PostgreSQL & Redis Cache',
    difficulty: 'Beginner',
    time: '5 min read',
    category: 'Databases & Billing',
    description: 'Keep your local database and in-memory cache synchronized with Stripe lifecycle events in real-time with zero polling latency.',
    steps: [
      'Listen to `invoice.payment_succeeded` and `customer.subscription.deleted`',
      'Validate Stripe cryptographic webhook signatures with built-in HMAC verification',
      'Execute parameterized UPSERT query into PostgreSQL database',
      'Invalidate and refresh user tier cache in Redis with TTL'
    ]
  }
];

export function GuidesPage() {
  const [selectedGuide, setSelectedGuide] = useState(null);

  return (
    <div className="py-16 md:py-24 px-5 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
          style={{ background: '#fff2ec', color: '#ff4f00', borderColor: '#ffd8c7' }}>
          <Compass className="w-3.5 h-3.5" /> Step-by-Step Blueprints
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink mb-6" style={{ color: '#1A1012' }}>
          AutomateX Guides & <span style={{ color: '#ff4f00' }}>Masterclasses</span>
        </h1>
        <p className="text-lg text-ink-body max-w-2xl mx-auto" style={{ color: '#5C5050' }}>
          Learn best practices for building production-grade automations, resilient queues, and AI-powered business workflows.
        </p>
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {GUIDES.map((g, i) => (
          <div
            key={i}
            className="p-8 rounded-3xl border border-cream-border bg-white hover:border-orange-500/50 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-cream text-ink-body">
                  {g.category}
                </span>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className={`font-semibold ${
                    g.difficulty === 'Beginner' ? 'text-emerald-600' : g.difficulty === 'Intermediate' ? 'text-orange-600' : 'text-purple-600'
                  }`}>
                    {g.difficulty}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {g.time}</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-ink mb-3">{g.title}</h3>
              <p className="text-sm text-ink-body leading-relaxed mb-6">{g.description}</p>
            </div>

            <div className="border-t border-cream-border pt-4 flex items-center justify-between">
              <button
                onClick={() => setSelectedGuide(g)}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                Read Blueprint Steps <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <Link
                to="/register"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-cream-soft text-ink hover:bg-ink hover:text-white transition-colors"
              >
                Clone Template
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Blueprint Detail Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-cream-border shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">{selectedGuide.category}</span>
              <button onClick={() => setSelectedGuide(null)} className="text-gray-400 hover:text-ink font-bold text-lg p-1">✕</button>
            </div>

            <h3 className="text-2xl font-bold text-ink mb-3">{selectedGuide.title}</h3>
            <p className="text-sm text-ink-body mb-6">{selectedGuide.description}</p>

            <div className="space-y-3 mb-8">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink">Architecture Steps:</h4>
              {selectedGuide.steps.map((st, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-ink-body bg-cream p-3 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <span>{st}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/register"
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-orange-500 text-white text-center hover:bg-orange-600"
              >
                Launch Blueprint in Workspace
              </Link>
              <button
                onClick={() => setSelectedGuide(null)}
                className="px-4 py-3 rounded-xl font-semibold text-sm border border-cream-border text-ink hover:bg-cream"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GuidesPage;
