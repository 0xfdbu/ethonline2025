// frontend/src/components/MainLayout/Sidebar.tsx

import React, { useState, useRef } from 'react';
import { Move, ArrowLeftRight, Shuffle, Fuel, Search, Github, Layers, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tooltip, setTooltip] = useState({ show: false, label: '', top: 0 });
  const itemRefs = useRef([]);
  const logoRef = useRef(null);

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/', external: false },
    { id: 'bridge', label: 'Bridge', icon: Move, path: '/bridge', external: false },
    { id: 'explorer', label: 'Explorer', icon: Search, path: '/explorer', external: false },
    { id: 'github', label: 'GitHub', icon: Github, path: 'https://github.com/0xfdbu/ethonline2025', external: true },
  ];

  // Compute active item based on current location
  const getActiveItem = () => {
    const pathname = location.pathname;
    if (pathname.startsWith('/intents/') || pathname === '/explorer') {
      return 'explorer';
    } else if (pathname === '/bridge') {
      return 'bridgerefuel';
    } else if (pathname === '/') {
      return 'home';
    }
    return 'home'; // default
  };

  const activeItem = getActiveItem();

  const handleNavigation = (item) => {
    if (item.external) {
      window.open(item.path, '_blank', 'noopener,noreferrer');
    } else {
      navigate(item.path);
    }
  };

  const handleMouseEnter = (el, label) => {
    if (el && window.innerWidth >= 768) { // Only on desktop
      const rect = el.getBoundingClientRect();
      setTooltip({ show: true, label, top: rect.top });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, label: '', top: 0 });
  };

  const isMobile = window.innerWidth < 768;

  return (
    <>
      {/* Desktop Sidebar (Vertical Left) */}
      {!isMobile && (
        <div
          className="fixed left-0 top-0 h-screen flex flex-col bg-white/15 backdrop-blur-xl border-r border-slate-200/50 transition-all duration-300 z-50 shadow-xl shadow-slate-100/50 w-20"
        >
          {/* Header */}
          <div className="h-16 flex items-center justify-center border-b border-slate-200/30">
            <div
              ref={logoRef}
              onMouseEnter={() => handleMouseEnter(logoRef.current, 'UniVail')}
              onMouseLeave={handleMouseLeave}
              className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl shadow-md shadow-slate-300/50 flex items-center justify-center cursor-default"
            >
              <Layers size={16} className="text-white" />
            </div>
          </div>

          {/* Main Navigation - CENTERED vertically */}
          <div className="flex-1 flex flex-col justify-center px-3">
            <div className="space-y-2 w-full">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    ref={(el) => (itemRefs.current[index] = el)}
                    onClick={() => handleNavigation(item)}
                    onMouseEnter={() => handleMouseEnter(itemRefs.current[index], item.label)}
                    onMouseLeave={handleMouseLeave}
                    className={`group w-full flex items-center justify-center px-0 py-3 rounded-xl transition-all duration-200 backdrop-blur-xl border border-transparent cursor-pointer ${
                      activeItem === item.id
                        ? 'bg-slate-900 text-white shadow-sm shadow-slate-800/50 border-slate-700/50'
                        : 'text-slate-600 hover:bg-slate-50/60 hover:text-slate-900 hover:shadow-sm hover:shadow-slate-100/50'
                    }`}
                  >
                    <div className="p-1.5 rounded-md">
                      <Icon size={18} className="flex-shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <div
          className="fixed bottom-0 left-0 right-0 h-16 bg-white/15 backdrop-blur-xl border-t border-slate-200/50 z-50 flex items-center justify-around px-4 md:hidden"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`flex flex-col items-center py-2 px-2 rounded-lg transition-all duration-200 ${
                  activeItem === item.id
                    ? 'bg-slate-900 text-white shadow-sm shadow-slate-800/50'
                    : 'text-slate-600 hover:bg-slate-50/60 hover:text-slate-900'
                }`}
              >
                <Icon size={20} className="mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Tooltip (Desktop Only) */}
      {!isMobile && tooltip.show && (
        <div
          className="fixed bg-slate-900 text-white px-3 py-1 rounded-md text-sm whitespace-nowrap shadow-lg pointer-events-none z-60"
          style={{ left: '80px', top: `${tooltip.top}px` }} // Adjusted for vertical sidebar
        >
          {tooltip.label}
        </div>
      )}
    </>
  );
}