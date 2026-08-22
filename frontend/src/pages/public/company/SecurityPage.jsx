import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Key, Server, FileCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

const CERTS = [
  { title: 'SOC2 Type II Ready', desc: 'Annual rigorous third-party audits evaluating security, availability, and confidentiality.' },
  { title: 'ISO/IEC 27001 Certified', desc: 'Global information security management standards verified across all infrastructure.' },
  { title: 'GDPR & CCPA Compliant', desc: 'Complete data residency controls, right-to-be-forgotten APIs, and strict DPA agreements.' },
  { title: 'HIPAA Compatible', desc: 'Dedicated air-gapped BAA configurations available for healthcare and health-tech workflows.' },
];

export function SecurityPage() {
  return (
    <div className="py-16 md:py-24 px-5 sm:px-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
          style={{ background: '#fff2ec', color: '#ff4f00', borderColor: '#ffd8c7' }}>
          <Shield className="w-3.5 h-3.5" /> Trust & Security Center
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink mb-6" style={{ color: '#1A1012' }}>
          Bank-grade encryption, <span style={{ color: '#ff4f00' }}>zero-trust architecture</span>
        </h1>
        <p className="text-lg text-ink-body max-w-2xl mx-auto" style={{ color: '#5C5050' }}>
          We treat every webhook payload, API key, and database credential with the highest standard of cryptographic isolation.
        </p>
      </div>

      {/* Security Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        <div className="p-6 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-ink mb-2">AES-256 GCM Encryption</h3>
          <p className="text-xs text-ink-body leading-relaxed">
            All stored credentials and OAuth tokens are encrypted at rest with AES-256 GCM using rotating AWS KMS master keys.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
            <Server className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-ink mb-2">V8 Micro-Sandboxes</h3>
          <p className="text-xs text-ink-body leading-relaxed">
            Custom code nodes run in strictly isolated memory sandboxes with memory limits and zero cross-tenant access.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
            <Key className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-ink mb-2">Zero-Knowledge Storage</h3>
          <p className="text-xs text-ink-body leading-relaxed">
            Secrets are decrypted strictly in memory at runtime and never persisted to application logs or client browser caches.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-ink mb-2">Continuous Audit Logs</h3>
          <p className="text-xs text-ink-body leading-relaxed">
            Immutable logs for every workflow modification, credential decrypt event, and user login with IP telemetry.
          </p>
        </div>
      </div>

      {/* Certifications Grid */}
      <div className="mb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-ink mb-2">Compliance & Certifications</h2>
          <p className="text-sm text-ink-body">Independently audited against international security frameworks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CERTS.map((c, i) => (
            <div key={i} className="p-6 rounded-3xl border border-cream-border bg-white flex items-start gap-4 shadow-xs">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-ink text-base mb-1">{c.title}</h3>
                <p className="text-xs text-ink-body leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vulnerability & Bug Bounty */}
      <div className="rounded-3xl p-8 sm:p-12 border border-cream-border bg-ink text-white mb-16 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400 mb-3">
          <AlertTriangle className="w-4 h-4" /> Responsible Disclosure & Bug Bounty
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Are you a security researcher?</h2>
        <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mb-6 leading-relaxed">
          We welcome vulnerability disclosures from security researchers worldwide. Valid security submissions are eligible for bounty payouts up to $5,000 USD.
        </p>
        <a
          href="mailto:security@automatex.dev"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-orange-500 hover:bg-orange-600 text-white transition-colors"
        >
          Submit Security Report (security@automatex.dev) →
        </a>
      </div>
    </div>
  );
}

export default SecurityPage;
