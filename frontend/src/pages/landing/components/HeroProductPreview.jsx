import React, { useState, useEffect } from 'react';
import {
  Zap, GitBranch, Cpu, Mail, CheckCircle2,
  Play, Settings, Clock, BarChart3, ArrowRight, Circle,
} from 'lucide-react';

/* ── Mini workflow nodes ──────────────────────────────────────────────── */
const NODES = [
  { id: 'trigger',   label: 'Webhook',     type: 'Trigger',   x: 80,  y: 60,  color: '#ff4f00' },
  { id: 'condition', label: 'IF Email ?',  type: 'Condition', x: 240, y: 60,  color: '#3D3030' },
  { id: 'ai',        label: 'Gemini AI',   type: 'AI',        x: 400, y: 60,  color: '#6366f1' },
  { id: 'gmail',     label: 'Send Email',  type: 'Gmail',     x: 560, y: 60,  color: '#3D3030' },
];

const EDGES = [
  { from: 'trigger', to: 'condition' },
  { from: 'condition', to: 'ai' },
  { from: 'ai', to: 'gmail' },
];

function MiniCanvas({ activeNode }) {
  return (
    <div style={{ position: 'relative', height: 140, width: '100%' }}>
      {/* SVG connector lines */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }} aria-hidden="true">
        {EDGES.map(({ from, to }) => {
          const f = NODES.find(n => n.id === from);
          const t = NODES.find(n => n.id === to);
          const x1 = f.x + 64, y1 = f.y + 28, x2 = t.x, y2 = t.y + 28;
          return (
            <g key={`${from}-${to}`}>
              <path
                d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`}
                stroke="#E0DDD6" strokeWidth="1.5" fill="none" strokeDasharray="4 3"
              />
              <path
                d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`}
                stroke="#ff4f00" strokeWidth="1.5" fill="none" strokeDasharray="4 3"
                style={{ strokeDashoffset: 0, animation: 'dashFlow 1.5s linear infinite', opacity: activeNode ? 0.8 : 0 }}
              />
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {NODES.map((node, i) => (
        <div
          key={node.id}
          style={{
            position: 'absolute',
            left: node.x,
            top: node.y,
            width: 112,
            height: 56,
            background: activeNode === node.id ? '#fff' : '#F7F5F0',
            border: `1.5px solid ${activeNode === node.id ? '#ff4f00' : '#E0DDD6'}`,
            borderRadius: 10,
            padding: '8px 10px',
            boxShadow: activeNode === node.id ? '0 0 0 3px rgba(255,79,0,0.15)' : 'none',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div
              style={{
                width: 16, height: 16, borderRadius: 4,
                background: node.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {node.id === 'trigger'   && <Zap className="w-2.5 h-2.5 fill-white text-white" />}
              {node.id === 'condition' && <GitBranch className="w-2.5 h-2.5 text-white" />}
              {node.id === 'ai'        && <Cpu className="w-2.5 h-2.5 text-white" />}
              {node.id === 'gmail'     && <Mail className="w-2.5 h-2.5 text-white" />}
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#1A1012', lineHeight: 1 }}>{node.type}</span>
            {activeNode === node.id && (
              <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#ff4f00', animation: 'nodePulse 1.5s infinite' }} />
            )}
          </div>
          <p style={{ fontSize: 9, color: '#9A8E8E', margin: 0, paddingLeft: 21, lineHeight: 1.3 }}>{node.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Execution log rows ───────────────────────────────────────────────── */
const LOG_ROWS = [
  { label: 'Webhook received',     status: 'ok',   time: '12ms' },
  { label: 'Condition evaluated',  status: 'ok',   time: '3ms' },
  { label: 'Gemini AI processing', status: 'run',  time: '840ms' },
  { label: 'Email dispatched',     status: 'ok',   time: '210ms' },
];

function ExecutionLog({ activeIdx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {LOG_ROWS.map((row, i) => (
        <div
          key={row.label}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 10px', borderRadius: 7,
            background: i === activeIdx ? 'rgba(255,79,0,0.06)' : 'transparent',
            border: `1px solid ${i === activeIdx ? 'rgba(255,79,0,0.2)' : 'transparent'}`,
            transition: 'all 0.3s ease',
          }}
        >
          <div style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            background: i < activeIdx
              ? '#22c55e'
              : i === activeIdx
                ? '#ff4f00'
                : '#E0DDD6',
            animation: i === activeIdx ? 'nodePulse 1.2s infinite' : 'none',
          }} />
          <span style={{ fontSize: 11, color: i <= activeIdx ? '#1A1012' : '#9A8E8E', flex: 1, fontWeight: i === activeIdx ? 600 : 400 }}>
            {row.label}
          </span>
          <span style={{ fontSize: 10, color: '#9A8E8E', fontFamily: 'monospace' }}>{i <= activeIdx ? row.time : '—'}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Sidebar items ────────────────────────────────────────────────────── */
const SIDEBAR = [
  { icon: BarChart3, label: 'Dashboard',   active: false },
  { icon: Zap,       label: 'Workflows',   active: true },
  { icon: Play,      label: 'Executions',  active: false },
  { icon: Settings,  label: 'Credentials', active: false },
];

/* ══════════════════════════════════════════════════════════════════════
   HERO PRODUCT PREVIEW
   ══════════════════════════════════════════════════════════════════════ */
export function HeroProductPreview() {
  const [activeNode, setActiveNode] = useState('trigger');
  const [activeLogIdx, setActiveLogIdx] = useState(0);

  const nodeIds = NODES.map(n => n.id);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode(prev => {
        const idx = nodeIds.indexOf(prev);
        const next = (idx + 1) % nodeIds.length;
        setActiveLogIdx(next);
        return nodeIds[next];
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -60,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 700,
          height: 300,
          background: 'radial-gradient(ellipse, rgba(255,79,0,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Main card */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          background: '#fff',
          border: '1px solid #E0DDD6',
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 -4px 40px rgba(26,16,18,0.08), 0 0 0 1px #E0DDD6',
          overflow: 'hidden',
          maxWidth: 1000,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          minHeight: 460,
        }}
      >
        {/* ── Sidebar ──────────────────────────────────── */}
        <div
          style={{
            background: '#F7F5F0',
            borderRight: '1px solid #E0DDD6',
            padding: '20px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {/* App logo in sidebar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', marginBottom: 16 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: '#ff4f00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap className="w-3.5 h-3.5 fill-white text-white" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1012' }}>AutomateX</span>
          </div>

          {SIDEBAR.map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px', borderRadius: 8,
                background: active ? '#fff' : 'transparent',
                border: active ? '1px solid #E0DDD6' : '1px solid transparent',
                cursor: 'default',
              }}
            >
              <Icon
                className="w-4 h-4"
                style={{ color: active ? '#ff4f00' : '#9A8E8E' }}
              />
              <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? '#1A1012' : '#9A8E8E' }}>
                {label}
              </span>
            </div>
          ))}

          {/* Stats mini-cards */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[{ label: 'Active', value: '12' }, { label: 'Today', value: '847' }].map(({ label, value }) => (
              <div key={label} style={{ background: '#fff', border: '1px solid #E0DDD6', borderRadius: 8, padding: '8px 10px' }}>
                <p style={{ fontSize: 9, color: '#9A8E8E', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#1A1012', margin: '2px 0 0' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main panel ───────────────────────────────── */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Header bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 11, color: '#9A8E8E', margin: 0 }}>Workflow</p>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1012', margin: 0 }}>Lead Capture → AI → Email</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600,
                padding: '4px 10px', borderRadius: 999,
                background: 'rgba(34,197,94,0.1)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'nodePulse 1.5s infinite' }} />
                LIVE
              </span>
              <span style={{ fontSize: 11, color: '#9A8E8E', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock className="w-3 h-3" /> Last run: 2m ago
              </span>
            </div>
          </div>

          {/* Canvas */}
          <div style={{ background: '#F7F5F0', border: '1px solid #E0DDD6', borderRadius: 10, padding: '16px 20px', overflowX: 'auto' }}>
            <MiniCanvas activeNode={activeNode} />
          </div>

          {/* Execution log */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#9A8E8E', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Execution trace
            </p>
            <ExecutionLog activeIdx={activeLogIdx} />
          </div>
        </div>
      </div>
    </div>
  );
}
