import React from 'react';
import { CheckCircle2, Zap, Cpu, BarChart3, Clock } from 'lucide-react';
import { useInView } from '../hooks/useInView';

const METRICS = [
  { label: 'Leads processed today',   value: '1,247',  delta: '+18%' },
  { label: 'AI responses generated',  value: '863',    delta: '+32%' },
  { label: 'Avg response time',       value: '1.2s',   delta: '-40%' },
];

const FLOW_LABELS = [
  { icon: Zap,         label: 'Webhook Trigger',   status: 'done'    },
  { icon: Cpu,         label: 'AI Classification', status: 'running' },
  { icon: CheckCircle2, label: 'Email Dispatch',   status: 'queued'  },
];

export function CaseStudy() {
  const [ref, inView] = useInView();

  return (
    <section
      style={{
        background: '#F7F5F0',
        padding: '100px 0',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        {/* Heading */}
        <div style={{ marginBottom: 56, maxWidth: 580 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#ff4f00', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Built for real work
          </p>
          <h2 style={{ fontSize: 'clamp(34px, 3.5vw, 52px)', fontWeight: 500, letterSpacing: '-0.02em', color: '#1A1012', lineHeight: 1.1, margin: '0 0 16px' }}>
            Turn complex work<br />into simple workflows
          </h2>
          <p style={{ fontSize: 17, color: '#5C5050', lineHeight: 1.65, margin: 0 }}>
            A single AutomateX workflow can replace hours of manual coordination — from raw input to final action, with AI intelligence at every step.
          </p>
        </div>

        {/* Main visualization */}
        <div
          ref={ref}
          style={{
            background: '#1A1012',
            borderRadius: 20,
            padding: 'clamp(24px, 4vw, 48px)',
            position: 'relative',
            overflow: 'hidden',
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(32px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
          }}
        >
          {/* Decorative grid */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }} aria-hidden="true">
            <defs>
              <pattern id="casegrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#fff" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#casegrid)" />
          </svg>

          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 40, alignItems: 'start' }}>

            {/* Left — workflow flow */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#9A8E8E', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>
                Workflow: Lead → AI → Outreach
              </p>
              {FLOW_LABELS.map(({ icon: Icon, label, status }, i) => (
                <React.Fragment key={label}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: status === 'running' ? 'rgba(255,79,0,0.08)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${status === 'running' ? 'rgba(255,79,0,0.25)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 10, padding: '12px 16px',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: status === 'done' ? '#16a34a' : status === 'running' ? '#ff4f00' : 'rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon className="w-4 h-4 text-white" style={{ color: '#fff' }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#F7F5F0', flex: 1 }}>{label}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 5,
                      background: status === 'done' ? 'rgba(34,197,94,0.15)' : status === 'running' ? 'rgba(255,79,0,0.2)' : 'rgba(255,255,255,0.06)',
                      color: status === 'done' ? '#4ade80' : status === 'running' ? '#ff4f00' : '#9A8E8E',
                    }}>
                      {status === 'done' ? '✓ Done' : status === 'running' ? 'Running' : 'Queued'}
                    </span>
                  </div>
                  {i < FLOW_LABELS.length - 1 && (
                    <div style={{ width: 2, height: 20, background: 'rgba(255,255,255,0.08)', marginLeft: 22 }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Right — metric cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#9A8E8E', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>
                Live metrics
              </p>
              {METRICS.map(({ label, value, delta }) => (
                <div
                  key={label}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 12, padding: '16px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <p style={{ fontSize: 11, color: '#9A8E8E', margin: 0 }}>{label}</p>
                    <p style={{ fontSize: 26, fontWeight: 600, color: '#F7F5F0', margin: '4px 0 0', letterSpacing: '-0.02em' }}>{value}</p>
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: 700, padding: '5px 10px', borderRadius: 8,
                    background: delta.startsWith('+') ? 'rgba(34,197,94,0.12)' : 'rgba(255,79,0,0.12)',
                    color: delta.startsWith('+') ? '#4ade80' : '#ff4f00',
                  }}>
                    {delta}
                  </span>
                </div>
              ))}

              {/* Bottom timing badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,79,0,0.08)', border: '1px solid rgba(255,79,0,0.2)', borderRadius: 10, padding: '10px 14px' }}>
                <Clock className="w-4 h-4" style={{ color: '#ff4f00' }} />
                <span style={{ fontSize: 13, color: '#F7F5F0', fontWeight: 500 }}>Entire pipeline runs in <strong style={{ color: '#ff4f00' }}>1.4 seconds</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
