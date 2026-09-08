import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../common/Toast';
import { AddLocationModal } from '../modals/AddLocationModal';
import { EditProfileModal } from '../modals/EditProfileModal';
import { AirQualityModal } from '../modals/AirQualityModal';
import { FloatingChatbotButton } from '../common/FloatingChatbotButton';

export const Layout = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('weathergpt_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('weathergpt_sidebar_collapsed', String(next));
      } catch (_) {}
      return next;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100">
      {/* Sidebar navigation */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Global Modals, Notifications & Floating Assistant */}
      <AddLocationModal />
      <EditProfileModal />
      <AirQualityModal />
      <FloatingChatbotButton />
      <ToastContainer />
    </div>
  );
};

