import React from 'react';
import { Shield, Lock, FileText, CheckCircle2 } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="py-16 md:py-24 px-5 sm:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12 border-b border-cream-border pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
          style={{ background: '#fff2ec', color: '#ff4f00', borderColor: '#ffd8c7' }}>
          <Shield className="w-3.5 h-3.5" /> Legal & Privacy
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink mb-4" style={{ color: '#1A1012' }}>
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500">Last updated: August 20, 2026 • Effective immediately</p>
      </div>

      {/* Content */}
      <div className="prose prose-stone max-w-none text-ink-body text-sm sm:text-base leading-relaxed space-y-8 bg-white p-8 sm:p-12 rounded-3xl border border-cream-border shadow-xs">
        <section>
          <h2 className="text-xl font-bold text-ink mb-3">1. Information We Collect</h2>
          <p>
            At AutomateX, we adhere strictly to data minimization principles. We only collect information strictly necessary to provide, secure, and improve our visual automation platform:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3 text-xs sm:text-sm">
            <li><strong>Account Information:</strong> Name, work email address, and authentication credentials upon signup.</li>
            <li><strong>Workflow Payloads:</strong> Webhook request bodies, node parameters, and execution state records processed on your behalf.</li>
            <li><strong>Credential Tokens:</strong> Encrypted third-party API keys and OAuth tokens stored in our isolated AES-256 vault.</li>
            <li><strong>Telemetry & Usage Data:</strong> Anonymized execution metrics, node latencies, error diagnostics, and system logs.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">2. How We Use Your Data</h2>
          <p>
            We process your information exclusively to execute your configured workflows, deliver real-time logs, prevent fraud or abuse, and maintain service reliability. <strong>We NEVER sell your personal data or workflow payloads to third-party data brokers or ad networks.</strong>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">3. Cryptographic Storage & Zero-Trust Vault</h2>
          <p>
            All third-party credentials (Slack tokens, Stripe API keys, database credentials) are encrypted at rest using AES-256 GCM encryption with rotating KMS hardware keys. Keys are decrypted exclusively in isolated worker memory runtimes during live node execution and never logged in plaintext.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">4. GDPR & CCPA Compliance Rights</h2>
          <p>
            Under European GDPR and California CCPA regulations, you maintain full rights regarding your data:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3 text-xs sm:text-sm">
            <li>Right to access and export your complete workflow execution history and account data in JSON format.</li>
            <li>Right to request instant deletion (Right to be Forgotten) of your account and all associated vault secrets.</li>
            <li>Right to restrict or object to automated telemetry collection.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">5. Contact Data Protection Officer</h2>
          <p>
            If you have questions regarding this Privacy Policy or wish to exercise your privacy rights, contact our Data Protection Officer at:
          </p>
          <div className="p-4 rounded-xl bg-cream border border-cream-border font-mono text-xs text-ink mt-2">
            Email: privacy@automatex.dev<br />
            AutomateX Security & Privacy Office<br />
            548 Market St, Suite 39201, San Francisco, CA 94104
          </div>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPage;
