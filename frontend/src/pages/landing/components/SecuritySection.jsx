import React from 'react';
import { Shield, Lock, Key, FileCheck, Activity } from 'lucide-react';
import { useInView } from '../hooks/useInView';

const SECURITY_ITEMS = [
  {
    icon: Lock,
    title: 'AES-256 Encryption',
    description: 'Every credential — API keys, OAuth tokens, secrets — stored with military-grade encryption at rest.',
  },
  {
    icon: Key,
    title: 'JWT Authentication',
    description: 'Stateless, signed JWT tokens with automatic refresh and 401 interceptor guards on every protected route.',
  },
  {
    icon: Shield,
    title: 'OAuth 2.0 Flows',
    description: 'Connect Google, Gmail, and partner services securely via OAuth — no passwords ever stored.',
  },
  {
    icon: FileCheck,
    title: 'GDPR Ready',
    description: 'Data residency controls, audit trails, and soft-delete capabilities for compliance-first teams.',
  },
  {
    icon: Activity,
    title: 'Audit Logs',
    description: 'Every workflow run, credential access, and configuration change logged with timestamps and user context.',
  },
];

export function SecuritySection() {
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

        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#ff4f00', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Security
          </p>
          <h2 style={{ fontSize: 'clamp(34px, 3.5vw, 48px)', fontWeight: 500, letterSpacing: '-0.02em', color: '#1A1012', lineHeight: 1.1, margin: '0 0 16px' }}>
            Security built into<br />every workflow
          </h2>
          <p style={{ fontSize: 17, color: '#5C5050', maxWidth: 520, margin: '0 auto' }}>
            Your credentials never leave the vault. Your data never touches our servers unencrypted. Full stop.
          </p>
        </div>

        <div
          ref={ref}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}
        >
          {SECURITY_ITEMS.map(({ icon: Icon, title, description }, i) => (
            <div
              key={title}
              style={{
                background: '#fff',
                border: '1px solid #E0DDD6',
                borderRadius: 14,
                padding: '28px 24px',
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.6s ${i * 0.1}s ease, transform 0.6s ${i * 0.1}s ease, box-shadow 0.2s ease`,
                cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,16,18,0.07)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div
                style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'rgba(255,79,0,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <Icon className="w-5 h-5" style={{ color: '#ff4f00' }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1012', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
                {title}
              </h3>
              <p style={{ fontSize: 14, color: '#5C5050', lineHeight: 1.6, margin: 0 }}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
