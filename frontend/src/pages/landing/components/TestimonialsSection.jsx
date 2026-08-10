import React from 'react';
import { useInView } from '../hooks/useInView';

const FEATURED = {
  quote: "AutomateX replaced a full-time ops role for us. We went from manually routing 800 leads a week to a fully automated pipeline — AI qualification, personalized emails, CRM updates — all in one workflow. Shipped it in an afternoon.",
  name: 'Priya Mehta',
  title: 'Head of Revenue Operations',
  company: 'Growthly',
  initials: 'PM',
  color: '#ff4f00',
};

const SUPPORTING = [
  {
    quote: "The Gemini AI node is genuinely impressive. We're classifying support tickets, generating drafts, and escalating edge cases — zero manual work.",
    name: 'Marcus Chen',
    title: 'CTO',
    company: 'Helios Dev',
    initials: 'MC',
    color: '#6366f1',
  },
  {
    quote: "I built a complete webhook → AI → Notion automation in 20 minutes. The execution debugger alone is worth it — I can see exactly what happened at every step.",
    name: 'Amara Osei',
    title: 'Senior Engineer',
    company: 'Inkbyte Labs',
    initials: 'AO',
    color: '#1A1012',
  },
  {
    quote: "We process 50,000 webhook events a day through AutomateX. 99.9% uptime, structured retries, and the credential vault makes compliance easy.",
    name: 'Santiago R.',
    title: 'Platform Lead',
    company: 'Vanta Studio',
    initials: 'SR',
    color: '#16a34a',
  },
];

function Avatar({ initials, color, size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0,
    }}>
      <span style={{ fontSize: size * 0.35, fontWeight: 700, color: '#fff' }}>{initials}</span>
    </div>
  );
}

export function TestimonialsSection() {
  const [ref, inView] = useInView();

  return (
    <section
      style={{
        background: '#fff',
        padding: '100px 0',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#ff4f00', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Customer stories
          </p>
          <h2 style={{ fontSize: 'clamp(34px, 3.5vw, 48px)', fontWeight: 500, letterSpacing: '-0.02em', color: '#1A1012', lineHeight: 1.1 }}>
            Real teams. Real results.
          </h2>
        </div>

        <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>

          {/* Featured large card */}
          <div
            style={{
              gridColumn: 'span 2',
              background: '#1A1012',
              borderRadius: 16,
              padding: '40px 44px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 32,
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(28px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = inView ? 'translateY(0)' : 'translateY(28px)'}
          >
            <div style={{ fontSize: 56, color: '#ff4f00', lineHeight: 1, userSelect: 'none' }}>"</div>
            <p style={{ fontSize: 'clamp(18px, 2vw, 22px)', color: '#F7F5F0', lineHeight: 1.6, fontWeight: 400, margin: 0 }}>
              {FEATURED.quote}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Avatar initials={FEATURED.initials} color={FEATURED.color} size={48} />
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#F7F5F0', margin: 0 }}>{FEATURED.name}</p>
                <p style={{ fontSize: 13, color: '#9A8E8E', margin: '2px 0 0' }}>{FEATURED.title} · {FEATURED.company}</p>
              </div>
            </div>
          </div>

          {/* Supporting cards */}
          {SUPPORTING.map((t, i) => (
            <div
              key={t.name}
              style={{
                background: '#F7F5F0',
                border: '1px solid #E0DDD6',
                borderRadius: 16,
                padding: '28px 30px',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(28px)',
                transition: `opacity 0.7s ${0.1 + i * 0.1}s ease, transform 0.7s ${0.1 + i * 0.1}s ease`,
                cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(26,16,18,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <p style={{ fontSize: 15, color: '#3D3030', lineHeight: 1.65, margin: 0, flex: 1 }}>"{t.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto' }}>
                <Avatar initials={t.initials} color={t.color} size={38} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1012', margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: '#9A8E8E', margin: '1px 0 0' }}>{t.title} · {t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
