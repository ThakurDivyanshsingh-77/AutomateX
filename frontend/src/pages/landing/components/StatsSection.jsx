import React from 'react';
import { useCounter } from '../hooks/useCounter';
import { useInView } from '../hooks/useInView';

const MINI_STATS = [
  { value: '12,000+', label: 'Active users',       suffix: '' },
  { value: '99.9%',   label: 'Uptime SLA',          suffix: '' },
  { value: '50,000+', label: 'Workflows running',   suffix: '' },
  { value: '50+',     label: 'Integrations',        suffix: '' },
];

function MiniStat({ value, label }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <p
        style={{
          fontSize: 'clamp(28px, 3vw, 40px)',
          fontWeight: 600,
          color: '#F7F5F0',
          margin: 0,
          letterSpacing: '-0.02em',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        {value}
      </p>
      <p style={{ fontSize: 14, color: '#9A8E8E', margin: '4px 0 0' }}>{label}</p>
    </div>
  );
}

export function StatsSection() {
  const [counterRef, count] = useCounter(593139013, 2400);
  const [headingRef, headingVisible] = useInView();

  return (
    <section
      style={{
        background: '#1A1012',
        padding: '100px 0',
        fontFamily: "'Inter', system-ui, sans-serif",
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Subtle grid lines */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#fff" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <div className="max-w-7xl mx-auto px-5 sm:px-8" style={{ position: 'relative' }}>

        {/* Heading */}
        <div
          ref={headingRef}
          style={{
            textAlign: 'center',
            marginBottom: 64,
            opacity: headingVisible ? 1 : 0,
            transform: headingVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 600, color: '#ff4f00', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            No hype. Just results.
          </p>
          <h2 style={{ fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 500, color: '#F7F5F0', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>
            Powering automation<br />at serious scale
          </h2>
        </div>

        {/* Big counter */}
        <div ref={counterRef} style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <p
              style={{
                fontSize: 'clamp(56px, 9vw, 120px)',
                fontWeight: 600,
                color: '#F7F5F0',
                letterSpacing: '-0.04em',
                lineHeight: 1,
                margin: 0,
              }}
            >
              {count}
            </p>
            {/* Orange underline accent */}
            <div style={{ height: 3, background: '#ff4f00', borderRadius: 2, marginTop: 8 }} />
          </div>
          <p style={{ fontSize: 18, color: '#9A8E8E', marginTop: 16, letterSpacing: '0.02em' }}>
            workflow steps executed
          </p>
        </div>

        {/* Mini stats grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 40,
            paddingTop: 48,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {MINI_STATS.map(({ value, label }) => (
            <MiniStat key={label} value={value} label={label} />
          ))}
        </div>
      </div>
    </section>
  );
}
