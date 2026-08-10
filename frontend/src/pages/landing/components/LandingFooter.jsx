import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const COLS = [
  {
    heading: 'Product',
    links: ['Features', 'Integrations', 'Pricing', 'Changelog', 'Status'],
  },
  {
    heading: 'Solutions',
    links: ['Developers', 'Engineering Teams', 'Startups', 'Enterprises', 'AI Automation'],
  },
  {
    heading: 'Resources',
    links: ['Documentation', 'API Reference', 'Guides', 'Blog', 'Support'],
  },
  {
    heading: 'Company',
    links: ['About', 'Careers', 'Contact', 'GitHub', 'Security'],
  },
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
              {['G', 'T', 'GH'].map((icon) => (
                <div
                  key={icon}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default',
                    fontSize: 11, fontWeight: 700, color: '#9A8E8E',
                  }}
                >
                  {icon}
                </div>
              ))}
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
                  <li key={link}>
                    <a
                      href="#"
                      style={{ fontSize: 14, color: '#9A8E8E', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#F7F5F0'}
                      onMouseLeave={e => e.currentTarget.style.color = '#9A8E8E'}
                    >
                      {link}
                    </a>
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
            © {new Date().getFullYear()} AutomateX. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy', 'Terms', 'Security', 'Cookies'].map((l) => (
              <a
                key={l}
                href="#"
                style={{ fontSize: 13, color: '#9A8E8E', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#F7F5F0'}
                onMouseLeave={e => e.currentTarget.style.color = '#9A8E8E'}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
