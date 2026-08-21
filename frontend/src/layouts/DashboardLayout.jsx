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
    <div className="h-screen w-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans overflow-hidden">
      <Navbar onToggleMobileMenu={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar isMobileOpen={isMobileMenuOpen} onCloseMobile={closeMobileMenu} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#09090b] custom-scrollbar pb-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
