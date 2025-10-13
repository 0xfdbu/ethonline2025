// src/components/MainLayout/Header.tsx

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { open } = useAppKit();

  const handleConnect = () => {
    open({ view: 'Connect' });
  };

  return (
    <header className="h-16 bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-3xl border-b border-white/20 pl-20 flex items-center justify-between px-4 lg:px-8 shadow-lg shadow-slate-200/20 sticky top-0 z-40">
      {/* Left: Search Bar */}
      <div className="flex-1 max-w-md">
        <div
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
            isSearchFocused
              ? 'bg-white/80 shadow-lg shadow-blue-500/20 border border-blue-300/30'
              : 'bg-white/40 border border-white/20 hover:bg-white/50'
          }`}
        >
          <Search
            size={18}
            className={`flex-shrink-0 transition-colors ${
              isSearchFocused ? 'text-blue-500' : 'text-slate-400'
            }`}
          />
          <input
            type="text"
            placeholder="Search addresses, tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-500 outline-none font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Right: Connect Wallet Button */}
      <div className="flex items-center gap-4 ml-auto">
        <button
          onClick={handleConnect}
          className="group relative px-6 py-2.5 rounded-xl font-semibold text-sm overflow-hidden transition-all duration-300"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-500/40" />
          
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Content */}
          <span className="relative text-white flex items-center gap-2">
            Connect Wallet
            <div className="w-2 h-2 rounded-full bg-white/70 group-hover:bg-white transition-colors" />
          </span>
        </button>
      </div>
    </header>
  );
}