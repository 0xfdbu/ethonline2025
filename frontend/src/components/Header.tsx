// components/Header.tsx
import React, { useState, useEffect } from 'react';
import { Menu, X, Zap, Sparkles, ChevronRight } from 'lucide-react';

interface HeaderProps {
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  onToggleSidebar
}) => {
  const [scrollY, setScrollY] = useState(0);
  const [showStatus, setShowStatus] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isScrolled = scrollY > 10;

  return (
    <>
      <header className={`sticky top-0 z-100 w-full transition-all duration-500 ${
        isScrolled ? 'backdrop-blur-xl bg-slate-950/80' : 'backdrop-blur-md bg-slate-950/40'
      } border-b border-white/10 shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            
            {/* Logo & Branding */}
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300 group-hover:blur-md"></div>
                <div className="relative p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg">
                  <Zap className="w-5 h-5 text-white" strokeWidth={3} />
                </div>
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold font-mono bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent tracking-wider">
                    Intent Forge
                  </h1>
                  <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full border border-emerald-400/30">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    <span className="text-xs font-mono text-emerald-300">Live</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 font-mono">Blockchain Orchestration</p>
              </div>
            </div>

            {/* Center - Navigation & Status */}
            <div className="hidden md:flex items-center gap-8">
              <nav className="flex items-center gap-6">
                <a href="#" className="text-sm font-mono text-gray-300 hover:text-cyan-400 transition-colors flex items-center gap-1 group">
                  Composer
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                </a>
                <a href="#" className="text-sm font-mono text-gray-300 hover:text-emerald-400 transition-colors flex items-center gap-1 group">
                  Analytics
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                </a>
                <a href="#" className="text-sm font-mono text-gray-300 hover:text-blue-400 transition-colors flex items-center gap-1 group">
                  Docs
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                </a>
              </nav>

              {/* Status Indicator */}
              <div className="pl-6 border-l border-white/10 flex items-center gap-2">
                <div className="flex flex-col text-right">
                  <span className="text-xs text-gray-400 font-mono">Network</span>
                  <span className="text-sm font-mono font-bold text-cyan-400">Mainnet</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                  <span className="text-xs font-bold">M</span>
                </div>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-3">
              {/* Connect Wallet Button */}
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-sm font-mono text-gray-300 hover:text-white transition-all duration-300">
                <Sparkles className="w-4 h-4" />
                <span>Connect</span>
              </button>

              {/* Mobile Menu Toggle */}
              {onToggleSidebar && (
                <button
                  onClick={onToggleSidebar}
                  className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white transition-all duration-300 group"
                >
                  {sidebarOpen ? (
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  ) : (
                    <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Accent Line */}
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
      </header>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};