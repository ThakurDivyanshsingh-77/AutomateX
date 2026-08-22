import React from 'react';
import { Outlet } from 'react-router-dom';
import { LandingNav } from '../pages/landing/components/LandingNav';
import { LandingFooter } from '../pages/landing/components/LandingFooter';
import { ScrollToTop } from '../components/common/ScrollToTop';

export function PublicLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F7F5F0',
        color: '#1A1012',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ScrollToTop />
      <LandingNav />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  );
}
export default PublicLayout;
