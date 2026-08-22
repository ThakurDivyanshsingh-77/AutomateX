import React from 'react';

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

/**
 * LandingPage — AutomateX public marketing page
 *
 * Section rhythm (top → bottom):
 *   Hero → Product Demo → Logo Cloud → Feature Showcase →
 *   Workflow Demo → Stats → Testimonials → Case Study →
 *   Benefits → Security → Pricing + Final CTA
 *
 * (Navbar and Footer are provided consistently by PublicLayout)
 */
export function LandingPage() {
  return (
    <div
      style={{
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        overflowX: 'clip',
      }}
    >
      {/* ① Hero + product preview (combined in Hero) */}
      <Hero />

      {/* ② Logo cloud / trusted-by marquee */}
      <LogoCloud />

      {/* ③ Feature showcase — 3 alternating blocks */}
      <FeatureShowcase />

      {/* ④ Live workflow demo — animated node chain */}
      <WorkflowDemo />

      {/* ⑤ Dark statistics band */}
      <StatsSection />

      {/* ⑥ Testimonials */}
      <TestimonialsSection />

      {/* ⑦ Case study / product story */}
      <CaseStudy />

      {/* ⑧ Benefits — numbered rows */}
      <BenefitsSection />

      {/* ⑨ Security grid */}
      <SecuritySection />

      {/* ⑩ Pricing + final CTA (dark) */}
      <FinalCTA />
    </div>
  );
}

export default LandingPage;
