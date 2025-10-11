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
  <header className="glass bg-gradient-to-r from-nexus-blue via-nexus-blue to-crypto-emerald/80 text-white p-4 shadow-lg w-full border-b border-white/10">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold font-mono tracking-wide">Intent Forge</h1>
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-full bg-white/10 hover:bg-white/20 transition backdrop-blur-sm"
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
        )}
        <button
          onClick={onToggleDark}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition backdrop-blur-sm"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  </header>
);