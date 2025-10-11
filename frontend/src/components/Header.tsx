import React from 'react';

interface HeaderProps {
  isDark: boolean;
  onToggleDark: () => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  isDark, 
  onToggleDark, 
  sidebarOpen, 
  onToggleSidebar 
}) => (
  <header className="bg-gradient-to-r from-nexus-blue to-indigo-600 text-white p-4 shadow-lg w-full">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Intent Forge</h1>
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded bg-white/20 hover:bg-white/30 transition"
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
        )}
        <button
          onClick={onToggleDark}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  </header>
);