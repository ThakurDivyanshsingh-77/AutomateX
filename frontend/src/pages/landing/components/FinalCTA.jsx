import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import { useInView } from '../hooks/useInView';

/* Subtle animated background node lines */
function BackgroundLines() {
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <defs>
        <pattern id="ctanodes" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
          <rect x="30" y="30" width="60" height="32" rx="6" fill="none" stroke="#fff" strokeWidth="0.8" />
          <line x1="60" y1="62" x2="60" y2="88" stroke="#fff" strokeWidth="0.8" strokeDasharray="3 3" />
          <rect x="30" y="88" width="60" height="32" rx="6" fill="none" stroke="#fff" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ctanodes)" />
    </svg>
  );
}

/* Pricing pill card (simple inline version for this section) */
const TIERS = [
  { name: 'Starter', price: 'Free', desc: '5 workflows · 100 runs/mo' },
  { name: 'Pro',     price: '$29',  desc: '50K runs/mo · AI nodes',   featured: true },
  { name: 'Enterprise', price: 'Custom', desc: 'Unlimited · SLA · SSO' },
];

export function FinalCTA() {
  const [ref, inView] = useInView();

  return (
    <section
      id="pricing"
      style={{
        background: '#1A1012',
        padding: '100px 0',
        fontFamily: "'Inter', system-ui, sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <BackgroundLines />

      <div
        ref={ref}
        className="max-w-7xl mx-auto px-5 sm:px-8"
        style={{ position: 'relative' }}
      >
        {/* ── Pricing mini-section ──────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#ff4f00', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Pricing
          </p>
          <h2 style={{
            fontSize: 'clamp(34px, 3.5vw, 52px)', fontWeight: 500, color: '#F7F5F0',
            letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 16px',
            opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(24px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}>
            Simple pricing.<br />Serious power.
          </h2>
          <p style={{ fontSize: 17, color: '#9A8E8E', opacity: inView ? 1 : 0, transition: 'opacity 0.7s 0.1s ease' }}>
            Start free. No credit card. Upgrade when you're ready.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 80 }}>
          {TIERS.map(({ name, price, desc, featured }, i) => (
            <div
              key={name}
              style={{
                background: featured ? '#ff4f00' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${featured ? '#ff4f00' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 16,
                padding: '32px 28px',
                textAlign: 'center',
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(28px)',
                transition: `opacity 0.6s ${0.1 + i * 0.1}s ease, transform 0.6s ${0.1 + i * 0.1}s ease`,
                cursor: 'default',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {featured && (
                <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.2)', borderRadius: 999, padding: '4px 12px', display: 'inline-block', marginBottom: 12 }}>
                  MOST POPULAR
                </div>
              )}
              <p style={{ fontSize: 13, fontWeight: 600, color: featured ? 'rgba(255,255,255,0.8)' : '#9A8E8E', margin: '0 0 8px' }}>{name}</p>
              <p style={{ fontSize: 40, fontWeight: 600, color: featured ? '#fff' : '#F7F5F0', letterSpacing: '-0.02em', margin: '0 0 8px' }}>{price}</p>
              <p style={{ fontSize: 13, color: featured ? 'rgba(255,255,255,0.7)' : '#9A8E8E', margin: '0 0 24px' }}>{desc}</p>
              <Link
                to="/register"
                style={{
                  display: 'block', padding: '11px 0', borderRadius: 10, fontSize: 14, fontWeight: 700,
                  background: featured ? '#fff' : 'transparent',
                  color: featured ? '#ff4f00' : '#F7F5F0',
                  border: featured ? 'none' : '1px solid rgba(255,255,255,0.15)',
                  textDecoration: 'none', transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>

        {/* ── Final CTA copy ──────────────────────────────────── */}
        <div
          style={{
            textAlign: 'center',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            paddingTop: 64,
            opacity: inView ? 1 : 0,
            transition: 'opacity 0.8s 0.3s ease',
          }}
        >
          <h2 style={{ fontSize: 'clamp(36px, 4.5vw, 64px)', fontWeight: 500, color: '#F7F5F0', letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 20px' }}>
            Ready to build<br />something better?
          </h2>
          <p style={{ fontSize: 18, color: '#9A8E8E', marginBottom: 36 }}>
            Start using AutomateX today. Free forever, no credit card required.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <Link
              to="/register"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#ff4f00', color: '#fff', fontWeight: 700,
                fontSize: 16, padding: '14px 30px', borderRadius: 12, textDecoration: 'none',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(255,79,0,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'transparent', color: '#F7F5F0', fontWeight: 600,
                fontSize: 16, padding: '13px 24px', borderRadius: 12, textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.12)',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
            >
              Sign in to AutomateX
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
