import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Play } from 'lucide-react';
import { HeroProductPreview } from './HeroProductPreview';

export function Hero() {
  const scrollToFeatures = () => {
    const el = document.querySelector('#features');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      style={{
        background: '#F7F5F0',
        paddingTop: '80px',
        paddingBottom: '0',
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        {/* ── Copy block ──────────────────────────────────────── */}
        <div className="text-center max-w-4xl mx-auto" style={{ paddingBottom: 48 }}>

          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 mb-6"
            style={{
              background: 'rgba(255,79,0,0.08)',
              border: '1px solid rgba(255,79,0,0.2)',
              borderRadius: 999,
              padding: '6px 16px',
              animation: 'fadeUp 0.5s ease both',
            }}
          >
            <span
              style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#ff4f00',
                animation: 'nodePulse 2s ease-in-out infinite',
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#ff4f00', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Workflow Automation Platform
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: 'clamp(48px, 7vw, 88px)',
              fontWeight: 500,
              lineHeight: 1.0,
              letterSpacing: '-0.03em',
              color: '#1A1012',
              margin: '0 0 24px',
              animation: 'fadeUp 0.6s 0.1s ease both',
              opacity: 0,
              animationFillMode: 'forwards',
            }}
          >
            Build smarter.<br />
            <span style={{ color: '#ff4f00' }}>Automate everything.</span>
          </h1>

          {/* Sub-copy */}
          <p
            style={{
              fontSize: 20,
              lineHeight: 1.6,
              color: '#5C5050',
              maxWidth: 560,
              margin: '0 auto 40px',
              animation: 'fadeUp 0.6s 0.2s ease both',
              opacity: 0,
              animationFillMode: 'forwards',
            }}
          >
            Connect your apps, trigger AI workflows, and ship automations
            in minutes — no code required. Built for modern engineering teams.
          </p>

          {/* CTA row */}
          <div
            className="flex flex-wrap items-center justify-center gap-3"
            style={{ animation: 'fadeUp 0.6s 0.3s ease both', opacity: 0, animationFillMode: 'forwards' }}
          >
            <Link
              to="/register"
              className="inline-flex items-center gap-2 font-semibold rounded-xl transition-all"
              style={{ background: '#ff4f00', color: '#fff', padding: '14px 28px', fontSize: 16, textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e64500'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,79,0,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#ff4f00'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={scrollToFeatures}
              className="inline-flex items-center gap-2 font-semibold rounded-xl transition-all"
              style={{
                background: 'transparent',
                color: '#1A1012',
                padding: '13px 24px',
                fontSize: 16,
                border: '1.5px solid #E0DDD6',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A1012'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E0DDD6'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Play className="w-4 h-4 fill-current" /> See how it works
            </button>
          </div>

          {/* Trust signals */}
          <div
            className="flex items-center justify-center gap-4 mt-8 flex-wrap"
            style={{ animation: 'fadeUp 0.6s 0.4s ease both', opacity: 0, animationFillMode: 'forwards' }}
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4" fill="#ff4f00" strokeWidth={0} style={{ color: '#ff4f00' }} />
              ))}
            </div>
            <span style={{ fontSize: 14, color: '#9A8E8E' }}>Trusted by 12,000+ automation engineers</span>
            <span style={{ width: 1, height: 16, background: '#E0DDD6', display: 'inline-block' }} />
            <span style={{ fontSize: 14, color: '#9A8E8E' }}>No credit card required</span>
          </div>
        </div>

        {/* ── Product preview ─────────────────────────────────── */}
        <div
          style={{
            animation: 'fadeUp 0.8s 0.5s ease both',
            opacity: 0,
            animationFillMode: 'forwards',
          }}
        >
          <HeroProductPreview />
        </div>
      </div>
    </section>
  );
}
