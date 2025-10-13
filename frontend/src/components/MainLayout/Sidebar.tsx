// frontend/src/components/MainLayout/Sidebar.tsx

import React, { useState, useRef } from 'react';
import { Move, ArrowLeftRight, Shuffle, Fuel, Search, Github, Bitcoin } from 'lucide-react';

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('bridge');
  const [tooltip, setTooltip] = useState({ show: false, label: '', top: 0 });
  const itemRefs = useRef([]);
  const logoRef = useRef(null);

  const menuItems = [
    { id: 'bridge', label: 'Bridge', icon: ArrowLeftRight },
    { id: 'swap', label: 'Swap', icon: Shuffle },
    { id: 'playground', label: 'Playground', icon: Move },
    { id: 'gasrefuel', label: 'Gas Refuel', icon: Fuel },
    { id: 'explorer', label: 'Explorer', icon: Search },
    { id: 'github', label: 'GitHub', icon: Github },
  ];

  const handleMouseEnter = (el, label) => {
    if (el) {
      const rect = el.getBoundingClientRect();
      setTooltip({ show: true, label, top: rect.top });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, label: '', top: 0 });
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className="fixed left-0 top-0 h-screen flex flex-col backdrop-blur-2xl bg-white/80 border-r border-slate-200/50 transition-all duration-300 z-50 shadow-xl shadow-slate-100/50 w-20"
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-center border-b border-slate-200/30">
          <div
            ref={logoRef}
            onMouseEnter={() => handleMouseEnter(logoRef.current, 'ChainHub')}
            onMouseLeave={handleMouseLeave}
            className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl shadow-md shadow-slate-300/50 flex items-center justify-center cursor-default"
          >
            <Bitcoin size={16} className="text-white" />
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
                  onClick={() => setActiveItem(item.id)}
                  onMouseEnter={() => handleMouseEnter(itemRefs.current[index], item.label)}
                  onMouseLeave={handleMouseLeave}
                  className={`group w-full flex items-center justify-center px-0 py-3 rounded-xl transition-all duration-200 backdrop-blur-sm border border-transparent cursor-pointer ${
                    activeItem === item.id
                      ? 'bg-slate-100/80 text-slate-900 shadow-sm shadow-slate-200/50 border-slate-200/50'
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

      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="fixed bg-slate-900 text-white px-3 py-1 rounded-md text-sm whitespace-nowrap shadow-lg pointer-events-none z-60"
          style={{ left: '80px', top: `${tooltip.top}px` }}
        >
          {tooltip.label}
        </div>
      )}
    </>
  );
}