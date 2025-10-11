import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  isDark: boolean;
  onToggleDark: () => void;
  onDragStart: (event: React.DragEvent, template: any) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  isDark,
  onToggleDark,
  onDragStart,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);  // Mobile toggle

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-gray-900' : 'bg-white'} transition-colors duration-300 w-full`}>
      <Header 
        isDark={isDark} 
        onToggleDark={onToggleDark}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="w-full flex">
        {/* Sidebar: Fixed on lg+, overlay on mobile */}
        <div className={`lg:w-64 lg:flex-shrink-0 transition-transform duration-300 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
          <Sidebar onDragStart={onDragStart} />
        </div>
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Main Content: Full width */}
        <main className="flex-1 w-full p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};