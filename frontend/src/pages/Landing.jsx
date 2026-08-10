import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, ArrowRight, CheckCircle2, Plug, Cpu, Shield, Timer,
  BarChart3, GitBranch, MessageSquare, Mail, Globe, ChevronDown,
  Star, Users, TrendingUp,
} from 'lucide-react';

/* ─── Inline SVG logo mark (lightning bolt) ─────────────────────────────── */
const BoltIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect width="32" height="32" rx="8" fill="#ff4f00" />
    <path
      d="M19 4L9 18h8l-4 10 14-16h-9l3-8z"
      fill="#fffefb"
      strokeLinejoin="round"
    />
  </svg>
);

/* ─── Workflow node SVG illustration ────────────────────────────────────── */
const WorkflowIllustration = () => (
  <svg viewBox="0 0 520 340" fill="none" className="w-full max-w-lg" aria-hidden="true">
    {/* Connection lines */}
    <line x1="120" y1="90" x2="220" y2="90" stroke="#c5c0b1" strokeWidth="1.5" strokeDasharray="5,4" />
    <line x1="300" y1="90" x2="400" y2="90" stroke="#c5c0b1" strokeWidth="1.5" strokeDasharray="5,4" />
    <line x1="220" y1="90" x2="260" y2="170" stroke="#c5c0b1" strokeWidth="1.5" strokeDasharray="5,4" />
    <line x1="300" y1="90" x2="260" y2="170" stroke="#c5c0b1" strokeWidth="1.5" strokeDasharray="5,4" />
    <line x1="260" y1="220" x2="260" y2="280" stroke="#c5c0b1" strokeWidth="1.5" strokeDasharray="5,4" />
    {/* Trigger node — orange */}
    <rect x="40" y="60" width="80" height="60" rx="12" fill="#ff4f00" />
    <text x="80" y="86" textAnchor="middle" fill="#fffefb" fontSize="9" fontWeight="600" fontFamily="Inter,sans-serif">TRIGGER</text>
    <text x="80" y="100" textAnchor="middle" fill="#fffefb" fontSize="8" fontFamily="Inter,sans-serif">Webhook</text>
    {/* Condition node — cream-soft */}
    <rect x="220" y="60" width="80" height="60" rx="12" fill="#f8f4f0" stroke="#c5c0b1" strokeWidth="1" />
    <text x="260" y="86" textAnchor="middle" fill="#201515" fontSize="9" fontWeight="600" fontFamily="Inter,sans-serif">CONDITION</text>
    <text x="260" y="100" textAnchor="middle" fill="#605d52" fontSize="8" fontFamily="Inter,sans-serif">If / Else</text>
    {/* Action node 1 — cream-soft */}
    <rect x="400" y="60" width="80" height="60" rx="12" fill="#f8f4f0" stroke="#c5c0b1" strokeWidth="1" />
    <text x="440" y="86" textAnchor="middle" fill="#201515" fontSize="9" fontWeight="600" fontFamily="Inter,sans-serif">ACTION</text>
    <text x="440" y="100" textAnchor="middle" fill="#605d52" fontSize="8" fontFamily="Inter,sans-serif">Send Email</text>
    {/* AI node — coffee ink */}
    <rect x="220" y="150" width="80" height="60" rx="12" fill="#201515" />
    <text x="260" y="176" textAnchor="middle" fill="#fffefb" fontSize="9" fontWeight="600" fontFamily="Inter,sans-serif">AI NODE</text>
    <text x="260" y="190" textAnchor="middle" fill="#939084" fontSize="8" fontFamily="Inter,sans-serif">Gemini</text>
    {/* Discord action */}
    <rect x="220" y="250" width="80" height="60" rx="12" fill="#f8f4f0" stroke="#c5c0b1" strokeWidth="1" />
    <text x="260" y="276" textAnchor="middle" fill="#201515" fontSize="9" fontWeight="600" fontFamily="Inter,sans-serif">DISCORD</text>
    <text x="260" y="290" textAnchor="middle" fill="#605d52" fontSize="8" fontFamily="Inter,sans-serif">Send Message</text>
    {/* Live pulse dot */}
    <circle cx="80" cy="90" r="5" fill="#fffefb" opacity="0.9" />
    <circle cx="80" cy="90" r="9" fill="#ff4f00" opacity="0.25">
      <animate attributeName="r" values="5;14;5" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.25;0;0.25" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>
);

/* ─── Integrations grid ─────────────────────────────────────────────────── */
const INTEGRATIONS = [
  { icon: Mail, label: 'Gmail', color: '#EA4335' },
  { icon: MessageSquare, label: 'Discord', color: '#5865F2' },
  { icon: Globe, label: 'Webhooks', color: '#ff4f00' },
  { icon: Cpu, label: 'AI / LLM', color: '#10B981' },
  { icon: BarChart3, label: 'MongoDB', color: '#4CAF50' },
  { icon: GitBranch, label: 'Conditions', color: '#201515' },
];

/* ─── Features ──────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: GitBranch,
    title: 'Visual Workflow Builder',
    body: 'Drag, connect, and configure nodes on a real-time canvas. Conditions, loops, and branching — no code required.',
    dark: false,
  },
  {
    icon: Cpu,
    title: 'AI-Powered Automation',
    body: 'Drop in OpenAI or Google Gemini nodes anywhere in your workflow to classify, summarize, or generate content at scale.',
    dark: true,
  },
  {
    icon: Plug,
    title: '50+ Node Types',
    body: 'Gmail, Discord, MongoDB, HTTP, Google Sheets, PDF generation, Cron scheduling — and a growing library.',
    dark: false,
  },
  {
    icon: Shield,
    title: 'Encrypted Credential Vault',
    body: 'Every API key, bot token, and OAuth secret stored AES-256 encrypted. Never exposed in logs or workflow JSON.',
    dark: false,
  },
  {
    icon: Timer,
    title: 'Cron & Webhook Triggers',
    body: 'Schedule workflows on any cron expression or receive real-time webhook payloads from any external service.',
    dark: true,
  },
  {
    icon: BarChart3,
    title: 'Execution History',
    body: 'Step-by-step execution logs, dead-letter queue replay, and a reliability dashboard — production-grade observability.',
    dark: false,
  },
];

/* ─── Pricing tiers ─────────────────────────────────────────────────────── */
const TIERS = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'For individuals exploring automation.',
    features: ['5 active workflows', '100 executions/month', '10 node types', 'Community support'],
    featured: false,
    cta: 'Get started free',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/ mo',
    description: 'For teams running production workflows.',
    features: ['Unlimited workflows', '50,000 executions/month', 'All node types incl. AI', 'Priority support', 'Execution history'],
    featured: true,
    cta: 'Start Pro trial',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For organisations at scale.',
    features: ['Unlimited everything', 'SLA guarantee', 'SSO / SAML', 'Dedicated support', 'On-prem option'],
    featured: false,
    cta: 'Contact sales',
  },
];

/* ─── FAQ ────────────────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: 'Do I need to write code?',
    a: 'No. AutomateX is fully visual. Drag nodes onto the canvas, configure them, and run. Power users can also inject custom HTTP calls or expressions.',
  },
  {
    q: 'Where are my credentials stored?',
    a: 'All API keys, tokens, and secrets are AES-256 encrypted at rest in the Credentials Vault. They are never exposed to the frontend or included in workflow JSON.',
  },
  {
    q: 'Which AI providers are supported?',
    a: 'Currently OpenAI (GPT-4o, GPT-4-turbo, GPT-3.5) and Google Gemini (1.5 Flash, 1.5 Pro, 2.0 Flash). More providers are on the roadmap.',
  },
  {
    q: 'Can I self-host?',
    a: 'Yes. The backend is a standard Node.js / Express app and the frontend is a Vite React SPA. Docker Compose files are provided.',
  },
];

/* ─── Stat ───────────────────────────────────────────────────────────────── */
const STATS = [
  { icon: Users, value: '12,000+', label: 'Active users' },
  { icon: TrendingUp, value: '2.4M', label: 'Workflow runs / month' },
  { icon: Plug, value: '50+', label: 'Integrations available' },
  { icon: Star, value: '4.9 / 5', label: 'Average user rating' },
];

/* ═══════════════════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
export const Landing = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="zap-surface min-h-screen flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="zap-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <BoltIcon size={28} />
            <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-ink)', letterSpacing: '-0.3px' }}>
              AutomateX
            </span>
          </Link>
          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-7">
            {['Features', 'Integrations', 'Pricing', 'Docs'].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="zap-body-sm no-underline transition-opacity"
                style={{ color: 'var(--color-body)', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-ink)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-body)'}
              >
                {l}
              </a>
            ))}
          </div>
          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link to="/login">
              <button className="zap-btn-tertiary zap-btn-sm" style={{ padding: '8px 18px', fontSize: 14.4 }}>
                Sign in
              </button>
            </Link>
            <Link to="/register">
              <button className="zap-btn-primary zap-btn-sm" style={{ padding: '8px 18px', fontSize: 14.4 }}>
                Get started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: 'var(--color-canvas)', padding: '80px 24px' }}>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          {/* Left copy */}
          <div className="flex-1 space-y-7 zap-fade-up">
            {/* Eyebrow badge */}
            <div className="zap-badge zap-eyebrow inline-flex" style={{ color: 'var(--color-primary)', borderColor: 'var(--color-mute)' }}>
              <span className="w-1.5 h-1.5 rounded-full zap-pulse" style={{ backgroundColor: 'var(--color-primary)' }} />
              Workflow automation for everyone
            </div>

            <h1 className="zap-display-xl" style={{ color: 'var(--color-ink)' }}>
              Automate anything.<br />
              <span style={{ color: 'var(--color-primary)' }}>No code required.</span>
            </h1>

            <p className="zap-body-lg" style={{ color: 'var(--color-body)', maxWidth: 480 }}>
              Connect your apps, trigger actions across 50+ integrations, and add AI intelligence to every workflow — visually, in minutes.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/register">
                <button className="zap-btn-primary zap-btn-md">
                  Start automating free
                  <ArrowRight size={18} />
                </button>
              </Link>
              <a href="#features">
                <button className="zap-btn-tertiary zap-btn-md">
                  See how it works
                </button>
              </a>
            </div>

            {/* Trust signals */}
            <div className="flex items-center gap-2 pt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="#ff4f00" strokeWidth={0} style={{ color: 'var(--color-primary)' }} />
              ))}
              <span className="zap-caption" style={{ color: 'var(--color-body-mid)', marginLeft: 4 }}>
                Trusted by 12,000+ automation teams
              </span>
            </div>
          </div>

          {/* Right — workflow illustration */}
          <div className="flex-1 flex items-center justify-center zap-fade-up zap-fade-up-2">
            <div className="zap-card w-full max-w-lg" style={{ padding: 32 }}>
              <WorkflowIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ──────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: 'var(--color-ink)', padding: '48px 24px' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {STATS.map(({ icon: Icon, value, label }, i) => (
            <div key={label} className={`space-y-2 zap-fade-up zap-fade-up-${i + 1}`}>
              <Icon size={22} style={{ color: 'var(--color-primary)', margin: '0 auto' }} />
              <p className="zap-display-sub-sm" style={{ color: 'var(--color-on-primary)' }}>{value}</p>
              <p className="zap-caption" style={{ color: 'var(--color-body-mid)' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTEGRATIONS ────────────────────────────────────────────────── */}
      <section id="integrations" style={{ backgroundColor: 'var(--color-canvas-soft)', padding: '80px 24px' }}>
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <p className="zap-eyebrow" style={{ color: 'var(--color-body-mid)' }}>Integrations</p>
            <h2 className="zap-display-md" style={{ color: 'var(--color-ink)' }}>
              Connect everything in your stack
            </h2>
            <p className="zap-body-md" style={{ color: 'var(--color-body)', maxWidth: 520, margin: '0 auto' }}>
              Gmail, Discord, MongoDB, Webhooks, AI — and 45+ more. Every integration uses your encrypted Credentials Vault.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5">
            {INTEGRATIONS.map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="zap-card flex flex-col items-center gap-3 text-center"
                style={{ padding: '20px 16px', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(32,21,21,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{ width: 44, height: 44, backgroundColor: `${color}15` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <span className="zap-btn-sm" style={{ color: 'var(--color-ink)', fontSize: 13 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section id="features" style={{ backgroundColor: 'var(--color-canvas)', padding: '80px 24px' }}>
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <p className="zap-eyebrow" style={{ color: 'var(--color-body-mid)' }}>Features</p>
            <h2 className="zap-display-md" style={{ color: 'var(--color-ink)' }}>
              Everything you need to automate
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, body, dark }, i) => (
              <div
                key={title}
                className={dark ? 'zap-card-dark' : 'zap-card'}
                style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(32,21,21,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div
                  className="flex items-center justify-center rounded-xl mb-4"
                  style={{ width: 44, height: 44, backgroundColor: dark ? 'rgba(255,79,0,0.2)' : 'rgba(255,79,0,0.08)' }}
                >
                  <Icon size={20} style={{ color: 'var(--color-primary)' }} />
                </div>
                <h3 className="zap-display-xs" style={{ color: dark ? 'var(--color-on-primary)' : 'var(--color-ink)', marginBottom: 8 }}>
                  {title}
                </h3>
                <p className="zap-body-sm" style={{ color: dark ? 'var(--color-body-mid)' : 'var(--color-body)', marginTop: 0 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: 'var(--color-primary)', padding: '80px 24px' }}>
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="zap-display-lg" style={{ color: 'var(--color-on-primary)' }}>
            Build your first workflow in minutes
          </h2>
          <p className="zap-body-lg" style={{ color: 'rgba(255,254,251,0.8)' }}>
            No credit card required. Get 5 free workflows and 100 executions per month — forever.
          </p>
          <Link to="/register">
            <button
              className="zap-btn-md"
              style={{
                backgroundColor: 'var(--color-on-primary)',
                color: 'var(--color-primary)',
                borderRadius: 'var(--rounded-md)',
                padding: '12px 32px',
                fontWeight: 700,
                fontSize: 18,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Create free account <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ backgroundColor: 'var(--color-canvas-soft)', padding: '80px 24px' }}>
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <p className="zap-eyebrow" style={{ color: 'var(--color-body-mid)' }}>Pricing</p>
            <h2 className="zap-display-md" style={{ color: 'var(--color-ink)' }}>Simple, honest pricing</h2>
            <p className="zap-body-md" style={{ color: 'var(--color-body)' }}>Start free. Scale when you're ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {TIERS.map(({ name, price, period, description, features, featured, cta }) => (
              <div
                key={name}
                className={featured ? 'zap-pricing-card-featured' : 'zap-pricing-card'}
                style={{ position: 'relative', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(32,21,21,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                {featured && (
                  <div
                    className="zap-badge zap-eyebrow"
                    style={{
                      position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                      backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)',
                      padding: '4px 14px', fontSize: 11,
                    }}
                  >
                    Most Popular
                  </div>
                )}
                <p className="zap-eyebrow" style={{ color: featured ? 'var(--color-body-mid)' : 'var(--color-body-mid)', marginBottom: 8 }}>{name}</p>
                <div className="flex items-end gap-1 mb-3">
                  <span className="zap-display-sub-sm" style={{ color: featured ? 'var(--color-on-primary)' : 'var(--color-ink)', fontSize: 36 }}>{price}</span>
                  {period && <span className="zap-body-md" style={{ color: featured ? 'var(--color-body-mid)' : 'var(--color-body)', paddingBottom: 4 }}>{period}</span>}
                </div>
                <p className="zap-body-sm" style={{ color: featured ? 'var(--color-body-mid)' : 'var(--color-body)', marginBottom: 20 }}>{description}</p>
                <ul className="space-y-3 mb-8">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle2 size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                      <span className="zap-body-sm" style={{ color: featured ? 'var(--color-canvas-soft)' : 'var(--color-ink)' }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <button
                    className={featured ? 'zap-btn-primary zap-btn-md' : 'zap-btn-tertiary zap-btn-md'}
                    style={{ width: '100%', justifyContent: 'center', ...(featured ? {} : { borderColor: 'var(--color-ink)' }) }}
                  >
                    {cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: 'var(--color-canvas)', padding: '80px 24px' }}>
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <p className="zap-eyebrow" style={{ color: 'var(--color-body-mid)' }}>FAQ</p>
            <h2 className="zap-display-md" style={{ color: 'var(--color-ink)' }}>Questions & answers</h2>
          </div>
          <div className="space-y-2">
            {FAQS.map(({ q, a }, i) => (
              <div
                key={q}
                className="zap-pricing-card"
                style={{ cursor: 'pointer', userSelect: 'none', transition: 'background 0.15s' }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="flex items-center justify-between">
                  <span className="zap-body-md" style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      color: 'var(--color-body-mid)',
                      transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.25s',
                      flexShrink: 0,
                    }}
                  />
                </div>
                {openFaq === i && (
                  <p className="zap-body-sm" style={{ color: 'var(--color-body)', marginTop: 12 }}>{a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="zap-footer">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BoltIcon size={24} />
                <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-on-primary)' }}>AutomateX</span>
              </div>
              <p className="zap-caption" style={{ color: 'var(--color-body-mid)', maxWidth: 240 }}>
                Visual workflow automation with AI. Connect anything, automate everything.
              </p>
            </div>
            {/* Links */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {[
                { heading: 'Product', links: ['Features', 'Integrations', 'Pricing', 'Changelog'] },
                { heading: 'Resources', links: ['Docs', 'API Reference', 'Templates', 'Blog'] },
                { heading: 'Company', links: ['About', 'Security', 'Privacy', 'Terms'] },
              ].map(({ heading, links }) => (
                <div key={heading}>
                  <p className="zap-eyebrow" style={{ color: 'var(--color-body-mid)', marginBottom: 12 }}>{heading}</p>
                  <ul className="space-y-2">
                    {links.map((l) => (
                      <li key={l}>
                        <a
                          href="#"
                          className="zap-caption"
                          style={{ color: 'var(--color-canvas-soft)', textDecoration: 'none', opacity: 0.8, transition: 'opacity 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
                        >
                          {l}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{ borderTop: '1px solid rgba(197,192,177,0.15)', paddingTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}
          >
            <span className="zap-caption" style={{ color: 'var(--color-body-mid)' }}>
              © {new Date().getFullYear()} AutomateX. All rights reserved.
            </span>
            <div className="flex items-center gap-2">
              <span className="zap-caption" style={{ color: 'var(--color-body-mid)' }}>Built with</span>
              <Zap size={12} style={{ color: 'var(--color-primary)' }} />
              <span className="zap-caption" style={{ color: 'var(--color-body-mid)' }}>by Divyansh</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
