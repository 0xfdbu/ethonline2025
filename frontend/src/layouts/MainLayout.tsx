import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  isDark: boolean;
  onToggleDark: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  isDark,
  onToggleDark,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen w-full ${isDark ? 'dark bg-gray-900' : 'bg-white'} transition-colors duration-300 flex flex-col w-full max-w-[1400px] mx-auto`}>
      <Header 
        isDark={isDark} 
        onToggleDark={onToggleDark}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 w-full flex overflow-hidden">
        {/* Sidebar: Fixed on left (lg+ inline, mobile overlay) */}
        <div 
          className={`inset-y-0 left-0 z-50 w-64 bg-gray-100 dark:bg-gray-700 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-64 lg:flex-shrink-0 overflow-y-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar />
        </div>
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Wrapper: Max 1400px centered, main takes right space */}
        <div className="flex-1 relative">
          <main className="flex-1 w-full p-2 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};