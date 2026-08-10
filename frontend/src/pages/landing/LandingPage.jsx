import React from 'react';

import { LandingNav }          from './components/LandingNav';
import { Hero }                from './components/Hero';
import { LogoCloud }           from './components/LogoCloud';
import { FeatureShowcase }     from './components/FeatureShowcase';
import { WorkflowDemo }        from './components/WorkflowDemo';
import { StatsSection }        from './components/StatsSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { CaseStudy }           from './components/CaseStudy';
import { BenefitsSection }     from './components/BenefitsSection';
import { SecuritySection }     from './components/SecuritySection';
import { FinalCTA }            from './components/FinalCTA';
import { LandingFooter }       from './components/LandingFooter';

/**
 * LandingPage — AutomateX public marketing page
 *
 * Section rhythm (top → bottom):
 *   Navbar → Hero → Product Demo → Logo Cloud → Feature Showcase →
 *   Workflow Demo → Stats → Testimonials → Case Study →
 *   Benefits → Security → Pricing + Final CTA → Footer
 *
 * Design system: Zapier-inspired warm cream / coffee ink / orange accent.
 * Zero impact on dashboard, auth, or any other app routes.
 */
export function LandingPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F7F5F0',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        overflowX: 'clip',
      }}
    >
      {/* ① Sticky navigation */}
      <LandingNav />

      {/* ② Hero + product preview (combined in Hero) */}
      <Hero />

      {/* ③ Logo cloud / trusted-by marquee */}
      <LogoCloud />

      {/* ④ Feature showcase — 3 alternating blocks */}
      <FeatureShowcase />

      {/* ⑤ Live workflow demo — animated node chain */}
      <WorkflowDemo />

      {/* ⑥ Dark statistics band */}
      <StatsSection />

      {/* ⑦ Testimonials */}
      <TestimonialsSection />

      {/* ⑧ Case study / product story */}
      <CaseStudy />

      {/* ⑨ Benefits — numbered rows */}
      <BenefitsSection />

      {/* ⑩ Security grid */}
      <SecuritySection />

      {/* ⑪ Pricing + final CTA (dark) */}
      <FinalCTA />

      {/* ⑫ Footer */}
      <LandingFooter />
    </div>
  );
}

export default LandingPage;
