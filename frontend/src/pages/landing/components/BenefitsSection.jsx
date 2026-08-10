import React from 'react';
import { useInView } from '../hooks/useInView';

const BENEFITS = [
  {
    num: '01',
    title: 'Automate repetitive work',
    description: 'Stop doing the same tasks twice. Build a workflow once, and AutomateX runs it every time — reliably, with full logging and retry support.',
  },
  {
    num: '02',
    title: 'Connect your entire stack',
    description: 'Gmail, Discord, Google Sheets, MongoDB, webhooks, HTTP APIs — every tool your team uses, connected in a single canvas.',
  },
  {
    num: '03',
    title: 'Move faster with AI',
    description: 'Add OpenAI or Gemini nodes anywhere in your workflow. Classify inputs, generate content, summarize data — all without leaving AutomateX.',
  },
  {
    num: '04',
    title: 'Stay in control, always',
    description: 'Execution history, dead-letter queues, step-level inspect, and credential vault encryption. Production-grade reliability from day one.',
  },
];

export function BenefitsSection() {
  const [ref, inView] = useInView();

  return (
    <section
      id="benefits"
      style={{
        background: '#fff',
        padding: '100px 0',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'start' }}>

          {/* Left — sticky label */}
          <div style={{ position: 'sticky', top: 80 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#ff4f00', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Why AutomateX
            </p>
            <h2 style={{ fontSize: 'clamp(34px, 3.5vw, 52px)', fontWeight: 500, letterSpacing: '-0.02em', color: '#1A1012', lineHeight: 1.1, margin: 0 }}>
              Four reasons teams switch to AutomateX
            </h2>
          </div>

          {/* Right — benefit rows */}
          <div ref={ref} style={{ display: 'flex', flexDirection: 'column' }}>
            {BENEFITS.map((b, i) => (
              <div
                key={b.num}
                style={{
                  padding: '36px 0',
                  borderBottom: i < BENEFITS.length - 1 ? '1px solid #E0DDD6' : 'none',
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateX(0)' : 'translateX(24px)',
                  transition: `opacity 0.6s ${i * 0.12}s ease, transform 0.6s ${i * 0.12}s ease`,
                }}
              >
                <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                  <span
                    style={{
                      fontSize: 13, fontWeight: 700, color: '#ff4f00',
                      fontFamily: 'monospace', flexShrink: 0, paddingTop: 4,
                    }}
                  >
                    {b.num}
                  </span>
                  <div>
                    <h3 style={{ fontSize: 22, fontWeight: 600, color: '#1A1012', letterSpacing: '-0.01em', margin: '0 0 10px' }}>
                      {b.title}
                    </h3>
                    <p style={{ fontSize: 16, color: '#5C5050', lineHeight: 1.65, margin: 0 }}>
                      {b.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
