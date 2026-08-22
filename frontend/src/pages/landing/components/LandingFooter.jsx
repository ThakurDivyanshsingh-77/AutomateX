import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Github, Twitter, MessageSquare, ArrowUpRight } from 'lucide-react';

const COLS = [
  {
    heading: 'Product',
    links: [
      { name: 'Features', path: '/features' },
      { name: 'Integrations', path: '/integrations' },
      { name: 'Pricing', path: '/pricing' },
      { name: 'Changelog', path: '/changelog' },
      { name: 'Status', path: '/status' },
    ],
  },
  {
    heading: 'Solutions',
    links: [
      { name: 'Developers', path: '/solutions/developers' },
      { name: 'Engineering Teams', path: '/solutions/engineering' },
      { name: 'Startups', path: '/solutions/startups' },
      { name: 'Enterprises', path: '/solutions/enterprises' },
      { name: 'AI Automation', path: '/solutions/ai-automation' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { name: 'Documentation', path: '/docs' },
      { name: 'API Reference', path: '/api-docs' },
      { name: 'Guides', path: '/guides' },
      { name: 'Blog', path: '/blog' },
      { name: 'Support', path: '/support' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { name: 'About', path: '/about' },
      { name: 'Careers', path: '/careers' },
      { name: 'Contact', path: '/contact' },
      { name: 'GitHub', path: 'https://github.com/ThakurDivyanshsingh-77/AutomateX', external: true },
      { name: 'Security', path: '/security' },
    ],
  },
];

const LEGAL_LINKS = [
  { name: 'Privacy', path: '/privacy' },
  { name: 'Terms', path: '/terms' },
  { name: 'Security', path: '/security' },
  { name: 'Cookies', path: '/cookies' },
];

export function LandingFooter() {
  return (
    <footer
      style={{
        background: '#1A1012',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Main grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 40,
            padding: '64px 0 48px',
          }}
        >
          {/* Brand column */}
          <div style={{ gridColumn: 'span 1' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: '#ff4f00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap className="w-4 h-4 fill-white text-white" />
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#F7F5F0' }}>AutomateX</span>
            </Link>
            <p style={{ fontSize: 13, color: '#9A8E8E', lineHeight: 1.6, margin: '0 0 16px', maxWidth: 200 }}>
              Visual workflow automation with AI. Connect everything, automate anything.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <a
                href="https://github.com/ThakurDivyanshsingh-77/AutomateX"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                style={{
                  width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#9A8E8E', textDecoration: 'none', transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F7F5F0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#9A8E8E'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              >
                GH
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Twitter"
                style={{
                  width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#9A8E8E', textDecoration: 'none', transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F7F5F0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#9A8E8E'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              >
                X
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Discord"
                style={{
                  width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#9A8E8E', textDecoration: 'none', transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F7F5F0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#9A8E8E'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              >
                DC
              </a>
            </div>
          </div>

          {/* Link columns */}
          {COLS.map(({ heading, links }) => (
            <div key={heading}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#F7F5F0', letterSpacing: '0.05em', marginBottom: 16, textTransform: 'uppercase' }}>
                {heading}
              </p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 14, color: '#9A8E8E', textDecoration: 'none', transition: 'color 0.15s', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onMouseEnter={e => e.currentTarget.style.color = '#F7F5F0'}
                        onMouseLeave={e => e.currentTarget.style.color = '#9A8E8E'}
                      >
                        {link.name}
                        <ArrowUpRight className="w-3 h-3 opacity-60" />
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        style={{ fontSize: 14, color: '#9A8E8E', textDecoration: 'none', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#F7F5F0'}
                        onMouseLeave={e => e.currentTarget.style.color = '#9A8E8E'}
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '24px 0',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 13, color: '#9A8E8E' }}>
            © {new Date().getFullYear()} AutomateX Inc. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: 24 }}>
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.name}
                to={l.path}
                style={{ fontSize: 13, color: '#9A8E8E', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#F7F5F0'}
                onMouseLeave={e => e.currentTarget.style.color = '#9A8E8E'}
              >
                {l.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
