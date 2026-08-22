import React from 'react';
import { FileText, ShieldCheck } from 'lucide-react';

export function TermsPage() {
  return (
    <div className="py-16 md:py-24 px-5 sm:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12 border-b border-cream-border pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
          style={{ background: '#fff2ec', color: '#ff4f00', borderColor: '#ffd8c7' }}>
          <FileText className="w-3.5 h-3.5" /> Terms of Service
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink mb-4" style={{ color: '#1A1012' }}>
          Terms of Service
        </h1>
        <p className="text-sm text-gray-500">Last updated: August 20, 2026 • Version 2.4</p>
      </div>

      {/* Content */}
      <div className="prose prose-stone max-w-none text-ink-body text-sm sm:text-base leading-relaxed space-y-8 bg-white p-8 sm:p-12 rounded-3xl border border-cream-border shadow-xs">
        <section>
          <h2 className="text-xl font-bold text-ink mb-3">1. Agreement to Terms</h2>
          <p>
            By accessing or using the AutomateX platform ("Service"), operated by AutomateX Inc., you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company or organization, you represent that you have the authority to bind such entity.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">2. Acceptable Use Policy</h2>
          <p>
            You agree not to use the AutomateX workflow execution engine or webhook endpoints for:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3 text-xs sm:text-sm">
            <li>Unsolicited bulk email spamming or automated phishing campaigns.</li>
            <li>Denial of service (DoS) attacks or automated vulnerability probing of third-party infrastructure.</li>
            <li>Processing or storing unencrypted sensitive payment data outside of certified tokenized vaults (e.g. raw credit card CVVs).</li>
            <li>Any activity violating local or international cybercrime legislation.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">3. Service Level Agreement (SLA) & Uptime</h2>
          <p>
            AutomateX commits to providing 99.99% service availability for Enterprise tier customers and 99.9% availability for Pro tier customers, excluding scheduled maintenance announced at least 48 hours in advance on our public Status Page.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">4. Intellectual Property & Workflow Ownership</h2>
          <p>
            You retain 100% intellectual property ownership of all custom workflows, JavaScript/Python code nodes, and data transforms created inside your workspaces. AutomateX claims no ownership over your workflow logic or data payloads.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">5. Termination & Data Portability</h2>
          <p>
            You may terminate your account at any time. Upon termination, you are entitled to export all active workflow schemas in JSON format before your account is purged from our production databases.
          </p>
        </section>
      </div>
    </div>
  );
}

export default TermsPage;
