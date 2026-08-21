import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';

export const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden relative selection:bg-brand-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-[30rem] h-[30rem] bg-orange-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Global Dashboard Navbar */}
      <Navbar onToggleMobileMenu={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen} />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar isMobileOpen={isMobileMenuOpen} onCloseMobile={closeMobileMenu} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar relative z-0">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

