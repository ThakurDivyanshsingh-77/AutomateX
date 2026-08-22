import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Code2, Terminal, Webhook, Cpu, GitBranch, ArrowRight, CheckCircle2, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export function DevelopersPage() {
  const [copiedCode, setCopiedCode] = useState(false);

  const sampleSnippet = `// Custom Code Node (V8 Sandbox)
export default async function handle({ payload, env }) {
  const { customerId, orderTotal } = payload;
  
  // Calculate VIP discount tier
  const discountMultiplier = orderTotal > 500 ? 0.20 : 0.05;
  const finalPrice = orderTotal * (1 - discountMultiplier);
  
  return {
    customerId,
    finalPrice,
    isVIP: orderTotal > 500,
    processedAt: new Date().toISOString()
  };
};`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleSnippet);
    setCopiedCode(true);
    toast.success('Snippet copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="py-16 md:py-24 px-5 sm:px-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
          style={{ background: '#fff2ec', color: '#ff4f00', borderColor: '#ffd8c7' }}>
          <Code2 className="w-3.5 h-3.5" /> Built for Software Engineers
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink mb-6" style={{ color: '#1A1012' }}>
          Code when you want to, <span style={{ color: '#ff4f00' }}>visual when you don't</span>
        </h1>
        <p className="text-lg text-ink-body max-w-2xl mx-auto" style={{ color: '#5C5050' }}>
          Combine visual branching with arbitrary TypeScript, Python, webhooks, and raw JSON payloads. No black boxes.
        </p>
      </div>

      {/* Code Sandbox Preview */}
      <div className="rounded-3xl border border-cream-border bg-ink text-white p-6 sm:p-10 mb-20 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs font-mono text-gray-400">custom-transform-node.ts</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedCode ? 'Copied' : 'Copy Code'}
          </button>
        </div>

        <pre className="font-mono text-xs sm:text-sm text-orange-200 overflow-x-auto leading-relaxed">
          <code>{sampleSnippet}</code>
        </pre>
      </div>

      {/* 3 Developer Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="p-8 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
            <Terminal className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-ink mb-3">Custom Code Nodes</h3>
          <p className="text-sm text-ink-body leading-relaxed mb-4">
            Execute arbitrary Node.js or Python code with full access to NPM libraries in secure, isolated micro-sandboxes.
          </p>
          <ul className="space-y-2 text-xs font-medium text-ink">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500" /> Full ES2024 & TypeScript support</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500" /> Sub-5ms sandbox cold starts</li>
          </ul>
        </div>

        <div className="p-8 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
            <Webhook className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-ink mb-3">Developer Webhook Hub</h3>
          <p className="text-sm text-ink-body leading-relaxed mb-4">
            Instant unique HTTPS endpoints with automated SSL certs, HMAC verification, and payload introspection.
          </p>
          <ul className="space-y-2 text-xs font-medium text-ink">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500" /> Real-time body & header inspect</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500" /> Zero-configuration CORS & Auth</li>
          </ul>
        </div>

        <div className="p-8 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
            <GitBranch className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-ink mb-3">Git Sync & CI/CD</h3>
          <p className="text-sm text-ink-body leading-relaxed mb-4">
            Store workflow definitions in Git as declarative JSON. Test in staging and promote to production seamlessly.
          </p>
          <ul className="space-y-2 text-xs font-medium text-ink">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500" /> Automated GitHub Actions deployment</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500" /> Semantic environment variables</li>
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-3xl p-8 sm:p-12 text-center bg-ink text-white">
        <h2 className="text-3xl font-bold mb-4">Start building code-native automations</h2>
        <p className="text-gray-400 max-w-xl mx-auto mb-8 text-sm">
          Join thousands of software engineers using AutomateX to automate microservices, background jobs, and AI tasks.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-3.5 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md transition-all flex items-center gap-2"
          >
            Create Free Developer Account <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/api-docs"
            className="px-6 py-3.5 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
          >
            Explore API Docs
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DevelopersPage;
