import React, { useEffect, useState } from 'react';
import { CheckCircle2, Zap, Cpu, Clock } from 'lucide-react';
import { useInView } from '../hooks/useInView';

const METRICS = [
  { label: 'Leads processed today', value: '1,247', delta: '+18%' },
  { label: 'AI responses generated', value: '863', delta: '+32%' },
  { label: 'Avg response time', value: '1.2s', delta: '-40%' },
];
const FLOW = [
  { icon: Zap, label: 'Webhook Trigger' },
  { icon: Cpu, label: 'AI Classification' },
  { icon: CheckCircle2, label: 'Email Dispatch' },
];

export function CaseStudy() {
  const [ref, inView] = useInView();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    const timer = window.setInterval(() => setActiveStep(step => (step + 1) % FLOW.length), 1500);
    return () => window.clearInterval(timer);
  }, [inView]);

  return (
    <section style={{ background: '#F7F5F0', padding: '100px 0', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div style={{ marginBottom: 56, maxWidth: 580 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#ff4f00', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Built for real work</p>
          <h2 style={{ fontSize: 'clamp(34px, 3.5vw, 52px)', fontWeight: 500, letterSpacing: '-.02em', color: '#1A1012', lineHeight: 1.1, margin: '0 0 16px' }}>
            Turn complex work<br />into simple workflows
          </h2>
          <p style={{ fontSize: 17, color: '#5C5050', lineHeight: 1.65, margin: 0 }}>
            A single AutomateX workflow can replace hours of manual coordination — from raw input to final action, with AI intelligence at every step.
          </p>
        </div>

        <div ref={ref} className="case-study-display" style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(32px)' }}>
          <div className="case-study-orb case-study-orb--one" aria-hidden="true" />
          <div className="case-study-orb case-study-orb--two" aria-hidden="true" />
          <svg className="case-study-grid" aria-hidden="true">
            <defs><pattern id="casegrid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="#fff" strokeWidth=".5" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#casegrid)" />
          </svg>

          <div className="case-study-layout">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p className="case-study-eyebrow">Workflow: Lead → AI → Outreach</p>
              {FLOW.map(({ icon: Icon, label }, index) => {
                const active = index === activeStep;
                const complete = index < activeStep;
                return (
                  <React.Fragment key={label}>
                    <div className={`case-study-node ${active ? 'is-active' : ''}`} style={{
                      background: active ? 'rgba(255,79,0,.1)' : 'rgba(255,255,255,.04)',
                      borderColor: active ? 'rgba(255,79,0,.38)' : complete ? 'rgba(74,222,128,.2)' : 'rgba(255,255,255,.07)',
                      animationDelay: `${index * 120}ms`, animationPlayState: inView ? 'running' : 'paused',
                    }}>
                      <div className={`case-study-icon ${active ? 'is-running' : ''}`} style={{ background: complete ? '#16a34a' : active ? '#ff4f00' : 'rgba(255,255,255,.06)' }}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="case-study-label">{label}</span>
                      <span className={`case-study-status ${complete ? 'is-done' : active ? 'is-running' : ''}`}>
                        {complete ? '✓ Done' : active ? 'Running' : 'Queued'}
                      </span>
                    </div>
                    {index < FLOW.length - 1 && <div className={`case-study-connector ${index < activeStep ? 'is-complete' : ''}`}>{index === activeStep && <span />}</div>}
                  </React.Fragment>
                );
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p className="case-study-eyebrow">Live metrics</p>
              {METRICS.map(({ label, value, delta }, index) => (
                <div key={label} className="case-study-metric" style={{ animationDelay: `${300 + index * 110}ms`, animationPlayState: inView ? 'running' : 'paused' }}>
                  <div><p>{label}</p><strong>{value}</strong></div>
                  <span className={delta.startsWith('+') ? 'positive' : 'negative'}>{delta}</span>
                </div>
              ))}
              <div className="case-study-timing"><Clock className="w-4 h-4" /><span>Entire pipeline runs in <strong>1.4 seconds</strong></span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
