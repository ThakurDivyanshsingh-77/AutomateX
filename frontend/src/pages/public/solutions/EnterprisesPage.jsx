import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Server, Users, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export function EnterprisesPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', company: '', email: '', executions: '1M - 10M' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Thank you! Our Enterprise Solutions Team will contact you shortly.');
    setSubmitted(true);
  };

  return (
    <div className="py-16 md:py-24 px-5 sm:px-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
          style={{ background: '#fff2ec', color: '#ff4f00', borderColor: '#ffd8c7' }}>
          <Shield className="w-3.5 h-3.5" /> Enterprise-Grade Automation
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink mb-6" style={{ color: '#1A1012' }}>
          Mission-critical reliability, <span style={{ color: '#ff4f00' }}>zero security compromises</span>
        </h1>
        <p className="text-lg text-ink-body max-w-2xl mx-auto" style={{ color: '#5C5050' }}>
          Deploy dedicated VPC clusters with full SOC2 Type II, HIPAA readiness, SAML SSO, and 99.99% guaranteed uptime SLA.
        </p>
      </div>

      {/* Enterprise Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        <div className="p-6 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-5">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-ink mb-2">Dedicated VPC & Self-Hosting</h3>
          <p className="text-xs text-ink-body leading-relaxed">
            Run AutomateX inside your own AWS, GCP, or Azure VPC with private database links and no multi-tenant cross-talk.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-5">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-ink mb-2">SOC2 Type II & HIPAA</h3>
          <p className="text-xs text-ink-body leading-relaxed">
            Annual third-party penetration testing, strict BAA agreements, zero-trust credential isolation, and audit readiness.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-5">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-ink mb-2">SAML 2.0 & Okta SSO</h3>
          <p className="text-xs text-ink-body leading-relaxed">
            Enforce corporate identity access management with automated SCIM user provisioning and granular RBAC permissions.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-5">
            <Server className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-ink mb-2">99.99% Uptime SLA</h3>
          <p className="text-xs text-ink-body leading-relaxed">
            Financial-backed service level agreements with 24/7 dedicated engineering response and designated Technical Account Managers.
          </p>
        </div>
      </div>

      {/* Enterprise Contact & Architecture Consultation */}
      <div className="rounded-3xl border border-cream-border bg-white p-8 sm:p-12 max-w-2xl mx-auto shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-2">Request Enterprise Architecture Demo</h2>
          <p className="text-xs sm:text-sm text-ink-body">Connect directly with our enterprise solution architects.</p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-emerald-800">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold">Request Received!</h3>
            <p className="text-xs mt-1">An AutomateX enterprise director will reach out within 2 hours to coordinate your custom POC.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="Sarah Jenkins"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-cream-soft"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">Company Name</label>
                <input
                  type="text"
                  placeholder="Global FinTech Corp"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-cream-soft"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">Corporate Email</label>
              <input
                type="email"
                placeholder="sarah@globalfintech.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-cream-soft"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">Expected Monthly Workflow Executions</label>
              <select
                value={formData.executions}
                onChange={e => setFormData({ ...formData, executions: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-cream-soft"
              >
                <option>500K - 1M executions</option>
                <option>1M - 10M executions</option>
                <option>10M+ executions</option>
                <option>Dedicated On-Prem / Air-Gapped Cluster</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-ink text-white hover:bg-ink-soft shadow-md transition-all flex items-center justify-center gap-2"
            >
              Request Custom Enterprise Architecture Review <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default EnterprisesPage;
