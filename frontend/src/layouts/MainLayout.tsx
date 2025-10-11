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
    <div className={`min-h-screen w-full ${isDark ? 'dark bg-gray-900' : 'bg-white'} transition-colors duration-300`}>
      <Header 
        isDark={isDark} 
        onToggleDark={onToggleDark}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="w-full flex">
        {/* Sidebar: Fixed overlay on mobile, inline on lg+ */}
        <div 
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-100 dark:bg-gray-700 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:w-64 lg:flex-shrink-0 overflow-y-auto`}
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
        {/* Main: Full width, auto-padding */}
        <main className="flex-1 w-full p-2 lg:p-6 min-h-[80vh]">
          {children}
        </main>
      </div>
    </div>
  );
};