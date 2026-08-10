import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Zap, ChevronDown } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Product',   href: '#features' },
  { label: 'Solutions', href: '#workflow' },
  { label: 'Resources', href: '#benefits' },
  { label: 'Pricing',   href: '#pricing' },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (href) => {
    setMobileOpen(false);
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-cream/90 backdrop-blur-md border-b border-cream-border shadow-sm'
            : 'bg-cream border-b border-cream-border'
        }`}
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[60px] flex items-center justify-between gap-6">

          {/* ── Brand ─────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0" style={{ textDecoration: 'none' }}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#ff4f00' }}
            >
              <Zap className="w-4 h-4 fill-white text-white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 17, color: '#1A1012', letterSpacing: '-0.3px' }}>
              AutomateX
            </span>
          </Link>

          {/* ── Center nav — desktop ──────────────────── */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <button
                key={label}
                onClick={() => handleNavClick(href)}
                className="flex items-center gap-0.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ color: '#5C5050', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#1A1012'; e.currentTarget.style.background = '#EFECEA'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#5C5050'; e.currentTarget.style.background = 'transparent'; }}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* ── Right CTAs — desktop ──────────────────── */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              to="/login"
              className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              style={{ color: '#5C5050', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#1A1012'; e.currentTarget.style.background = '#EFECEA'; e.currentTarget.style.borderRadius = '8px'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#5C5050'; e.currentTarget.style.background = 'transparent'; }}
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-all"
              style={{ background: '#ff4f00', color: '#fff', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e64500'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#ff4f00'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Get started
            </Link>
          </div>

          {/* ── Hamburger — mobile ────────────────────── */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ background: mobileOpen ? '#EFECEA' : 'transparent', border: 'none', cursor: 'pointer' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen
              ? <X className="w-5 h-5" style={{ color: '#1A1012' }} />
              : <Menu className="w-5 h-5" style={{ color: '#1A1012' }} />}
          </button>
        </div>

        {/* ── Mobile menu ───────────────────────────── */}
        {mobileOpen && (
          <div
            className="md:hidden border-t"
            style={{ background: '#F7F5F0', borderColor: '#E0DDD6' }}
          >
            <div className="px-5 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <button
                  key={label}
                  onClick={() => handleNavClick(href)}
                  className="text-left px-4 py-3 rounded-lg text-sm font-medium w-full"
                  style={{ color: '#1A1012', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#EFECEA'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {label}
                </button>
              ))}
              <div className="pt-3 border-t flex flex-col gap-2" style={{ borderColor: '#E0DDD6' }}>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-center px-4 py-3 rounded-lg text-sm font-medium"
                  style={{ color: '#1A1012', textDecoration: 'none', background: '#EFECEA' }}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="text-center px-4 py-3 rounded-lg text-sm font-semibold"
                  style={{ background: '#ff4f00', color: '#fff', textDecoration: 'none' }}
                >
                  Get started free
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer for fixed nav */}
      <div className="h-[60px]" />
    </>
  );
}
