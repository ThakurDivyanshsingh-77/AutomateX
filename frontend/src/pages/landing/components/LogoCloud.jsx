import React from 'react';

const LOGOS = [
  'Stripe', 'Notion', 'Linear', 'Vercel', 'Figma',
  'GitHub', 'Slack', 'Airtable', 'Loom', 'Intercom',
];

export function LogoCloud() {
  // Duplicate for seamless marquee loop
  const all = [...LOGOS, ...LOGOS];

  return (
    <section
      style={{
        background: '#F7F5F0',
        borderTop: '1px solid #E0DDD6',
        borderBottom: '1px solid #E0DDD6',
        padding: '48px 0',
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center mb-8">
        <p style={{ fontSize: 13, fontWeight: 500, color: '#9A8E8E', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Trusted by teams building the future
        </p>
      </div>

      {/* Marquee track */}
      <div style={{ overflow: 'hidden', position: 'relative' }}>
        {/* Fade edges */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 100,
          background: 'linear-gradient(to right, #F7F5F0, transparent)',
          zIndex: 2, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 100,
          background: 'linear-gradient(to left, #F7F5F0, transparent)',
          zIndex: 2, pointerEvents: 'none',
        }} />

        <div
          style={{
            display: 'flex',
            gap: 40,
            width: 'max-content',
            animation: 'marquee 28s linear infinite',
          }}
        >
          {all.map((name, i) => (
            <div
              key={`${name}-${i}`}
              style={{
                display: 'flex', alignItems: 'center',
                padding: '10px 28px',
                background: '#fff',
                border: '1px solid #E0DDD6',
                borderRadius: 10,
                cursor: 'default',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#9A8E8E',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                }}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
