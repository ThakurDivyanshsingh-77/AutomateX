import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Zap, HelpCircle, ChevronDown, ChevronUp, Sparkles, Shield, ArrowRight } from 'lucide-react';

const PLANS = [
  {
    name: 'Free Forever',
    badge: 'Developer Sandbox',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Perfect for indie hackers, prototyping workflows, and personal side-projects.',
    buttonText: 'Get Started Free',
    buttonLink: '/register',
    highlighted: false,
    features: [
      '1,000 workflow executions / month',
      '5 active workflows',
      '15-minute polling interval',
      'Standard Webhook triggers',
      'Community Discord support',
      '7-day execution logs retention',
    ],
  },
  {
    name: 'Developer Pro',
    badge: 'Most Popular',
    monthlyPrice: 29,
    annualPrice: 24,
    description: 'For engineers and builders needing fast execution, AI agents, and dead-letter queues.',
    buttonText: 'Start 14-Day Free Trial',
    buttonLink: '/register',
    highlighted: true,
    features: [
      '50,000 workflow executions / month',
      'Unlimited active workflows',
      'Sub-second real-time execution',
      'Autonomous AI prompt-to-workflow engine',
      'Dead Letter Queue & Auto-retries',
      'Custom JavaScript & Python sandbox',
      '30-day execution history & replay',
      'Priority email support',
    ],
  },
  {
    name: 'Team',
    badge: 'Fast-Growing Startups',
    monthlyPrice: 99,
    annualPrice: 79,
    description: 'For growing teams requiring collaborative workspaces, shared vaults, and RBAC.',
    buttonText: 'Start Team Trial',
    buttonLink: '/register',
    highlighted: false,
    features: [
      '250,000 workflow executions / month',
      'Unlimited team members & RBAC',
      'Shared AES-256 OAuth Credential Vault',
      'Git sync & environment promotion (Staging/Prod)',
      'Custom domain webhooks',
      '90-day execution audit logs',
      'Dedicated Slack support channel',
    ],
  },
  {
    name: 'Enterprise',
    badge: 'Mission Critical',
    monthlyPrice: 'Custom',
    annualPrice: 'Custom',
    description: 'For organizations demanding dedicated VPC instances, custom SLAs, and SOC2 compliance.',
    buttonText: 'Contact Sales',
    buttonLink: '/contact',
    highlighted: false,
    features: [
      'Unlimited multi-million executions',
      'Self-hosted or dedicated cloud VPC deployment',
      '99.99% guaranteed uptime SLA',
      'SAML 2.0 / Okta / Azure SSO integration',
      'Custom SLA & 24/7 on-call engineering support',
      'Full SOC2 Type II & HIPAA compliance report',
      'Tailored custom node connectors development',
    ],
  },
];

const FAQS = [
  {
    q: 'How are workflow executions counted?',
    a: 'An execution is counted each time an active trigger triggers and starts a workflow run, regardless of how many individual steps or branches are within that workflow.',
  },
  {
    q: 'Can I switch plans or cancel at any time?',
    a: 'Yes, you can upgrade, downgrade, or cancel your subscription at any point directly inside your workspace settings. Prorated balances are credited automatically.',
  },
  {
    q: 'What happens if I exceed my monthly execution limit?',
    a: 'We will never drop your live production webhook events. We provide a 10% grace buffer and alert you before pausing non-critical executions, or you can enable auto-scaling overages.',
  },
  {
    q: 'Do you offer discounts for open-source projects and startups?',
    a: 'Absolutely! We offer up to $10,000 in credits for verified early-stage startups and 100% free Pro tier grants for approved open-source repositories.',
  },
  {
    q: 'Where are my API credentials and tokens stored?',
    a: 'All third-party credentials and OAuth tokens are stored in an isolated AES-256 GCM encrypted vault with rotating KMS keys. We enforce zero-knowledge storage across the board.',
  },
];

export function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="py-16 md:py-24 px-5 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
          style={{ background: '#fff2ec', color: '#ff4f00', borderColor: '#ffd8c7' }}>
          <Sparkles className="w-3.5 h-3.5" /> Simple, Transparent Pricing
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink mb-6" style={{ color: '#1A1012' }}>
          Predictable pricing that <span style={{ color: '#ff4f00' }}>scales with you</span>
        </h1>
        <p className="text-lg text-ink-body max-w-2xl mx-auto" style={{ color: '#5C5050' }}>
          Start free forever. Upgrade when you need higher execution volume, AI intelligence, or enterprise security.
        </p>

        {/* Annual / Monthly Toggle */}
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-cream-soft border border-cream-border mt-8">
          <button
            onClick={() => setAnnual(false)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              !annual ? 'bg-white text-ink shadow-xs' : 'text-ink-body hover:text-ink'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              annual ? 'bg-orange-500 text-white shadow-xs' : 'text-ink-body hover:text-ink'
            }`}
          >
            Annual Billing
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        {PLANS.map((plan, i) => (
          <div
            key={i}
            className={`rounded-3xl p-7 border flex flex-col justify-between transition-all duration-300 ${
              plan.highlighted
                ? 'bg-ink text-white border-orange-500 shadow-2xl relative scale-100 lg:-translate-y-2'
                : 'bg-white text-ink border-cream-border hover:shadow-lg'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold uppercase tracking-wider">
                {plan.badge}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                {!plan.highlighted && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cream text-ink-body">
                    {plan.badge}
                  </span>
                )}
              </div>
              <p className={`text-xs mb-6 ${plan.highlighted ? 'text-gray-400' : 'text-ink-body'}`}>
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-6 flex items-baseline gap-1">
                {typeof plan.monthlyPrice === 'number' ? (
                  <>
                    <span className="text-4xl font-extrabold">
                      ${annual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className={`text-xs ${plan.highlighted ? 'text-gray-400' : 'text-gray-500'}`}>
                      / month
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-extrabold">{plan.monthlyPrice}</span>
                )}
              </div>

              {/* Action Button */}
              <Link
                to={plan.buttonLink}
                className={`w-full py-3 rounded-xl font-bold text-sm block text-center transition-all mb-8 ${
                  plan.highlighted
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
                    : 'bg-cream-soft hover:bg-cream border border-cream-border text-ink'
                }`}
              >
                {plan.buttonText}
              </Link>

              {/* Features List */}
              <div className="space-y-3">
                <div className={`text-xs font-bold uppercase tracking-wider ${plan.highlighted ? 'text-gray-400' : 'text-gray-500'}`}>
                  Included in this plan:
                </div>
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs font-medium">
                    <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlighted ? 'text-orange-400' : 'text-emerald-600'}`} />
                    <span className={plan.highlighted ? 'text-gray-300' : 'text-ink'}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQs Section */}
      <div className="max-w-3xl mx-auto mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-ink mb-2">Frequently Asked Questions</h2>
          <p className="text-sm text-ink-body">Everything you need to know about our pricing and execution limits.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="border border-cream-border rounded-2xl bg-white overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full p-5 text-left flex items-center justify-between font-semibold text-ink text-sm sm:text-base"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-5 h-5 text-orange-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-ink-body leading-relaxed border-t border-cream-border pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Enterprise Consultation Banner */}
      <div className="rounded-3xl p-8 sm:p-12 border border-cream-border bg-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-2">
            <Shield className="w-4 h-4" /> Need custom compliance or high-volume SLA?
          </div>
          <h3 className="text-2xl font-bold text-ink mb-2">Talk to our enterprise automation architects</h3>
          <p className="text-sm text-ink-body">
            Get a tailored architecture review, custom connector development, and dedicated VPC migration support.
          </p>
        </div>
        <Link
          to="/contact"
          className="px-6 py-3.5 rounded-xl font-bold text-sm bg-ink text-white hover:bg-ink-soft shrink-0 flex items-center gap-2 transition-all"
        >
          Schedule Technical Consultation <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default PricingPage;
