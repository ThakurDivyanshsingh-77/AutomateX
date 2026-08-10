import React, { useState, useEffect } from 'react';
import { Zap, GitBranch, Cpu, Mail, CheckCircle2 } from 'lucide-react';
import { useInView } from '../hooks/useInView';

const WORKFLOW_STEPS = [
  {
    id: 'webhook',
    icon: Zap,
    type: 'TRIGGER',
    label: 'Webhook Received',
    desc: 'POST /webhooks/lead-capture',
    color: '#ff4f00',
    iconBg: '#ff4f00',
  },
  {
    id: 'condition',
    icon: GitBranch,
    type: 'CONDITION',
    label: 'Evaluate Lead Score',
    desc: 'score > 80 → high-priority',
    color: '#1A1012',
    iconBg: '#3D3030',
  },
  {
    id: 'ai',
    icon: Cpu,
    type: 'AI NODE',
    label: 'Gemini → Personalize',
    desc: 'Generate tailored follow-up message',
    color: '#6366f1',
    iconBg: '#6366f1',
  },
  {
    id: 'email',
    icon: Mail,
    type: 'ACTION',
    label: 'Gmail → Send Email',
    desc: 'Deliver personalized outreach',
    color: '#1A1012',
    iconBg: '#3D3030',
  },
  {
    id: 'done',
    icon: CheckCircle2,
    type: 'COMPLETE',
    label: 'Workflow Finished',
    desc: 'Execution logged · 1.4s total',
    color: '#22c55e',
    iconBg: '#16a34a',
  },
];

export function WorkflowDemo() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [ref, inView] = useInView();

  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % WORKFLOW_STEPS.length);
    }, 1600);
    return () => clearInterval(interval);
  }, [inView]);

  return (
    <section
      id="workflow"
      style={{
        background: '#F7F5F0',
        padding: '100px 0',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 64, alignItems: 'center' }}>

          {/* ── Left copy ───────────────────────────────────── */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#ff4f00', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Live Workflow
            </p>
            <h2 style={{ fontSize: 'clamp(34px, 3.5vw, 48px)', fontWeight: 500, letterSpacing: '-0.02em', color: '#1A1012', lineHeight: 1.1, marginBottom: 20 }}>
              See your automations<br />come alive
            </h2>
            <p style={{ fontSize: 17, color: '#5C5050', lineHeight: 1.65, marginBottom: 32 }}>
              Every workflow runs step by step. Watch data flow through triggers, conditions, AI nodes, and actions in real time — with full visibility at every stage.
            </p>

            {/* Step descriptions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {WORKFLOW_STEPS.map((step, i) => (
                <div
                  key={step.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    opacity: i === activeIdx ? 1 : 0.4,
                    transition: 'opacity 0.4s ease',
                  }}
                >
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: i === activeIdx ? step.color : '#E0DDD6',
                    flexShrink: 0,
                    transition: 'background 0.3s',
                  }} />
                  <span style={{ fontSize: 14, fontWeight: i === activeIdx ? 600 : 400, color: i === activeIdx ? '#1A1012' : '#9A8E8E' }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right — animated node chain ──────────────────── */}
          <div ref={ref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            {WORKFLOW_STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === activeIdx;
              const isDone   = i < activeIdx;

              return (
                <React.Fragment key={step.id}>
                  {/* Node card */}
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 360,
                      background: isActive ? '#fff' : isDone ? '#fff' : '#fff',
                      border: `1.5px solid ${isActive ? step.color : isDone ? '#22c55e' : '#E0DDD6'}`,
                      borderRadius: 12,
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      boxShadow: isActive ? `0 4px 20px rgba(0,0,0,0.06), 0 0 0 3px ${step.color}22` : 'none',
                      transition: 'all 0.4s ease',
                      position: 'relative',
                    }}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: isActive ? step.iconBg : isDone ? '#16a34a' : '#F7F5F0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.4s ease',
                        animation: isActive ? 'nodePulse 1.5s ease-in-out infinite' : 'none',
                      }}
                    >
                      {isDone && !isActive
                        ? <CheckCircle2 className="w-5 h-5 text-white" />
                        : <Icon className={`w-5 h-5 ${isActive || isDone ? 'text-white' : ''}`} style={{ color: isActive || isDone ? '#fff' : '#9A8E8E' }} />
                      }
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: isActive ? step.color : isDone ? '#22c55e' : '#9A8E8E', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
                        {step.type}
                      </p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1012', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {step.label}
                      </p>
                      <p style={{ fontSize: 11, color: '#9A8E8E', margin: '2px 0 0', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {step.desc}
                      </p>
                    </div>

                    {/* Active badge */}
                    {isActive && (
                      <span style={{
                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                        fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 5,
                        background: `${step.color}15`, color: step.color,
                        border: `1px solid ${step.color}30`,
                      }}>
                        Running
                      </span>
                    )}
                  </div>

                  {/* Connector line */}
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div style={{ position: 'relative', width: 2, height: 28, margin: '0 auto' }}>
                      <div style={{ position: 'absolute', inset: 0, background: '#E0DDD6' }} />
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: isDone ? '#22c55e' : i === activeIdx - 1 ? '#ff4f00' : 'transparent',
                        transition: 'background 0.4s ease',
                      }} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
