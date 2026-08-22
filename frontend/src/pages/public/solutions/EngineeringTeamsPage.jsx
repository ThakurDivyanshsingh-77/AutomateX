import React from 'react';
import { Link } from 'react-router-dom';
import { Users, GitPullRequest, Activity, ShieldCheck, ArrowRight, Zap, CheckCircle2, Server } from 'lucide-react';

export function EngineeringTeamsPage() {
  return (
    <div className="py-16 md:py-24 px-5 sm:px-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
          style={{ background: '#fff2ec', color: '#ff4f00', borderColor: '#ffd8c7' }}>
          <Users className="w-3.5 h-3.5" /> For Engineering & DevOps Teams
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink mb-6" style={{ color: '#1A1012' }}>
          Eliminate glue code and <span style={{ color: '#ff4f00' }}>accelerate release velocity</span>
        </h1>
        <p className="text-lg text-ink-body max-w-2xl mx-auto" style={{ color: '#5C5050' }}>
          Standardize internal automation, incident orchestration, and DevOps pipelines with enterprise reliability.
        </p>
      </div>

      {/* Grid of Team Workflows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <div className="p-8 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
            <GitPullRequest className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-ink mb-3">Automated PR & Code Quality Triage</h3>
          <p className="text-sm text-ink-body leading-relaxed mb-6">
            Automatically trigger AI code review summaries on GitHub PRs, check security dependencies, and notify review channels with context.
          </p>
          <div className="p-4 rounded-xl bg-cream font-mono text-xs text-ink space-y-1">
            <div className="text-gray-500">// Workflow Flow:</div>
            <div>GitHub PR Opened → AI Summary → Snyk Scan → Slack Approval</div>
          </div>
        </div>

        <div className="p-8 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-ink mb-3">Real-time Incident Orchestration</h3>
          <p className="text-sm text-ink-body leading-relaxed mb-6">
            Ingest Datadog or Sentry error spikes, spin up incident channels on Slack, page on-call engineers, and draft root-cause summaries.
          </p>
          <div className="p-4 rounded-xl bg-cream font-mono text-xs text-ink space-y-1">
            <div className="text-gray-500">// Workflow Flow:</div>
            <div>Datadog P1 Alert → Create Slack War Room → PageDuty → Jira Ticket</div>
          </div>
        </div>

        <div className="p-8 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
            <Server className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-ink mb-3">Multi-Environment Promotion</h3>
          <p className="text-sm text-ink-body leading-relaxed mb-6">
            Keep development, staging, and production workflows cleanly separated with environment variable scopes and locked releases.
          </p>
          <div className="p-4 rounded-xl bg-cream font-mono text-xs text-ink space-y-1">
            <div className="text-gray-500">// Workflow Flow:</div>
            <div>Test Canvas → Git Review → Merge main → Deploy to Production</div>
          </div>
        </div>

        <div className="p-8 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-ink mb-3">Audit Logs & Compliance Gates</h3>
          <p className="text-sm text-ink-body leading-relaxed mb-6">
            Track who changed which node, credential usage logs, and maintain continuous SOC2 & ISO 27001 readiness.
          </p>
          <div className="p-4 rounded-xl bg-cream font-mono text-xs text-ink space-y-1">
            <div className="text-gray-500">// Audit Trail:</div>
            <div>Immutable JSON logs stored with 90-day retention & S3 export</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-3xl p-8 sm:p-12 text-center bg-orange-500 text-white">
        <h2 className="text-3xl font-bold mb-4">Empower your engineering team today</h2>
        <p className="text-orange-100 max-w-xl mx-auto mb-8 text-sm">
          Reduce technical debt and unblock non-engineering teams with secure, audited workflow bridges.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-white text-orange-600 hover:bg-orange-50 shadow-md transition-all"
        >
          Try AutomateX for Teams <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default EngineeringTeamsPage;
