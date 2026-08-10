import React from 'react';
import { ArrowRight, GitBranch, Cpu, BarChart3 } from 'lucide-react';
import { useInView } from '../hooks/useInView';

/* ── Reusable section heading ─────────────────────────────────────── */
function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="text-center" style={{ maxWidth: 640, margin: '0 auto 72px' }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: '#ff4f00', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
        {eyebrow}
      </p>
      <h2 style={{ fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 500, letterSpacing: '-0.02em', color: '#1A1012', lineHeight: 1.1, marginBottom: 16 }}>
        {title}
      </h2>
      {description && (
        <p style={{ fontSize: 18, color: '#5C5050', lineHeight: 1.6 }}>{description}</p>
      )}
    </div>
  );
}

/* ── Feature 1 — Visual Builder UI mockup ──────────────────────────── */
function VisualBuilderMockup() {
  const nodes = [
    { x: 30,  y: 50,  w: 110, label: 'Webhook',    type: 'Trigger',   color: '#ff4f00' },
    { x: 180, y: 25,  w: 110, label: 'IF Condition', type: 'Logic',    color: '#1A1012' },
    { x: 330, y: 25,  w: 110, label: 'Gemini AI',   type: 'AI',        color: '#6366f1' },
    { x: 180, y: 115, w: 110, label: 'Delay 30s',   type: 'Control',   color: '#9A8E8E' },
    { x: 330, y: 115, w: 110, label: 'Send Email',  type: 'Action',    color: '#1A1012' },
  ];

  return (
    <div
      style={{
        background: '#F7F5F0',
        border: '1px solid #E0DDD6',
        borderRadius: 14,
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 240,
      }}
    >
      {/* Grid dots */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} aria-hidden="true">
        <defs>
          <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#C5C0B1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      <div style={{ position: 'relative', height: 200 }}>
        <svg width="480" height="200" style={{ position: 'absolute', top: 0, left: 0 }} aria-hidden="true">
          {/* edges */}
          <line x1="140" y1="75" x2="180" y2="50" stroke="#E0DDD6" strokeWidth="1.5" strokeDasharray="4 3" />
          <line x1="140" y1="75" x2="180" y2="140" stroke="#E0DDD6" strokeWidth="1.5" strokeDasharray="4 3" />
          <line x1="290" y1="50" x2="330" y2="50" stroke="#ff4f00" strokeWidth="1.5" strokeDasharray="4 3" style={{ animation: 'dashFlow 1.2s linear infinite' }} />
          <line x1="290" y1="140" x2="330" y2="140" stroke="#E0DDD6" strokeWidth="1.5" strokeDasharray="4 3" />
        </svg>

        {nodes.map((n, i) => (
          <div
            key={n.label}
            style={{
              position: 'absolute', left: n.x, top: n.y,
              width: n.w, background: '#fff',
              border: `1.5px solid ${i === 2 ? '#ff4f00' : '#E0DDD6'}`,
              borderRadius: 8, padding: '8px 10px',
              boxShadow: i === 2 ? '0 0 0 3px rgba(255,79,0,0.1)' : 'none',
            }}
          >
            <p style={{ fontSize: 9, color: n.color, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{n.type}</p>
            <p style={{ fontSize: 11, color: '#1A1012', fontWeight: 600, margin: '2px 0 0' }}>{n.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Feature 2 — AI Node mockup ────────────────────────────────────── */
function AiNodeMockup() {
  return (
    <div style={{ background: '#1A1012', borderRadius: 14, padding: 24, minHeight: 240 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <div style={{ width: 28, height: 28, background: '#6366f1', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Cpu className="w-4 h-4 text-white" />
        </div>
        <div>
          <p style={{ fontSize: 10, color: '#9A8E8E', margin: 0 }}>AI Node</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#F7F5F0', margin: 0 }}>Gemini → Generate Text</p>
        </div>
        <div style={{ marginLeft: 'auto', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 600, color: '#818cf8' }}>
          Configured
        </div>
      </div>

      {[
        { label: 'Model', value: 'gemini-2.0-flash', color: '#818cf8' },
        { label: 'Prompt', value: '{{trigger.message}}', color: '#9A8E8E' },
        { label: 'Max tokens', value: '2048', color: '#9A8E8E' },
        { label: 'Credential', value: 'Gemini Prod Key ✓', color: '#22c55e' },
      ].map(({ label, value, color }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 12, color: '#5C5050' }}>{label}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color, fontFamily: value.startsWith('{') ? 'monospace' : 'inherit' }}>{value}</span>
        </div>
      ))}

      <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px' }}>
        <p style={{ fontSize: 10, color: '#9A8E8E', margin: '0 0 4px' }}>Output preview</p>
        <p style={{ fontSize: 12, color: '#F7F5F0', margin: 0, lineHeight: 1.5 }}>
          "Your account has been successfully activated. Welcome to the platform..."
        </p>
      </div>
    </div>
  );
}

/* ── Feature 3 — Execution history mockup ──────────────────────────── */
function ExecutionHistoryMockup() {
  const rows = [
    { id: '#4821', wf: 'Lead Capture',   status: 'success', time: '1.2s',  ago: '2m ago' },
    { id: '#4820', wf: 'Email Drip',     status: 'success', time: '0.8s',  ago: '7m ago' },
    { id: '#4819', wf: 'AI Classifier',  status: 'running', time: '...',   ago: '12m ago' },
    { id: '#4818', wf: 'Slack Notify',   status: 'success', time: '0.4s',  ago: '18m ago' },
    { id: '#4817', wf: 'Report Gen',     status: 'error',   time: '12.3s', ago: '1h ago' },
  ];

  const statusStyles = {
    success: { bg: 'rgba(34,197,94,0.1)',  color: '#16a34a', label: 'Success' },
    running: { bg: 'rgba(255,79,0,0.1)',   color: '#ff4f00', label: 'Running' },
    error:   { bg: 'rgba(239,68,68,0.1)',  color: '#ef4444', label: 'Error'   },
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #E0DDD6', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #E0DDD6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1012', margin: 0 }}>Execution History</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {['All', 'Success', 'Error'].map((t, i) => (
            <span key={t} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: i === 0 ? '#ff4f00' : '#F7F5F0', color: i === 0 ? '#fff' : '#5C5050', fontWeight: 600, cursor: 'default' }}>{t}</span>
          ))}
        </div>
      </div>
      {rows.map((row, i) => {
        const s = statusStyles[row.status];
        return (
          <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: i < rows.length - 1 ? '1px solid #E0DDD6' : 'none', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F7F5F0'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#9A8E8E', width: 44 }}>{row.id}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1012', flex: 1 }}>{row.wf}</span>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: s.bg, color: s.color }}>{s.label}</span>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#9A8E8E', width: 40, textAlign: 'right' }}>{row.time}</span>
            <span style={{ fontSize: 11, color: '#9A8E8E', width: 50, textAlign: 'right' }}>{row.ago}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Feature block ──────────────────────────────────────────────────── */
function FeatureBlock({ eyebrow, title, description, link, ui, reverse = false }) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 64,
        alignItems: 'center',
        marginBottom: 100,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      {/* Text */}
      <div style={{ order: reverse ? 2 : 1 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#ff4f00', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
          {eyebrow}
        </p>
        <h3 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 500, letterSpacing: '-0.02em', color: '#1A1012', lineHeight: 1.15, marginBottom: 16 }}>
          {title}
        </h3>
        <p style={{ fontSize: 17, color: '#5C5050', lineHeight: 1.65, marginBottom: 24 }}>
          {description}
        </p>
        <a
          href="#"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 600, color: '#ff4f00', textDecoration: 'none' }}
          onMouseEnter={e => e.currentTarget.style.gap = '10px'}
          onMouseLeave={e => e.currentTarget.style.gap = '6px'}
        >
          {link} <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* UI */}
      <div style={{ order: reverse ? 1 : 2 }}>
        {ui}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   FEATURE SHOWCASE
   ══════════════════════════════════════════════════════════════════════ */
export function FeatureShowcase() {
  return (
    <section
      id="features"
      style={{
        background: '#fff',
        padding: '100px 0 20px',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        <SectionHeading
          eyebrow="Powerful features"
          title={<>Everything you need<br />to automate at scale</>}
          description="From simple webhooks to multi-step AI workflows — build once, run forever."
        />

        <FeatureBlock
          eyebrow="Visual Builder"
          title="Design workflows without writing a single line"
          description="Drag nodes onto a canvas, connect them, and configure each step with a clean properties panel. Branching logic, retries, and error handling — all visual."
          link="Explore the builder"
          ui={<VisualBuilderMockup />}
        />

        <FeatureBlock
          eyebrow="AI Nodes"
          title="Drop AI into any workflow in seconds"
          description="OpenAI and Google Gemini nodes slot into your existing automations. Pass live data as prompts, capture structured responses, and route on AI decisions."
          link="See AI integrations"
          ui={<AiNodeMockup />}
          reverse
        />

        <FeatureBlock
          eyebrow="Execution History"
          title="Full observability on every run"
          description="Step-by-step execution logs, input/output data at each node, error traces, and one-click replay. Know exactly what happened and why."
          link="View execution logs"
          ui={<ExecutionHistoryMockup />}
        />
      </div>
    </section>
  );
}
