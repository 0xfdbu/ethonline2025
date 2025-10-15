// src/layouts/MainLayout.tsx
import React from 'react';
import { NexusProvider } from '@avail-project/nexus-widgets';
import Sidebar from '../components/MainLayout/Sidebar';
import Header from '../components/MainLayout/Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      {/* Light Elegant Background */}
      <div className="fixed inset-0 z-0">
        {/* Soft greyish base */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-slate-200 to-gray-300"></div>
        
        {/* Muted colorful gradient accents */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-violet-300/30 rounded-full filter blur-[140px] animate-float-gentle"></div>
        <div className="absolute bottom-0 left-1/3 w-[550px] h-[550px] bg-blue-300/25 rounded-full filter blur-[140px] animate-float-gentle-delayed"></div>
        <div className="absolute top-1/2 right-1/3 w-[500px] h-[500px] bg-indigo-300/20 rounded-full filter blur-[140px] animate-float-gentle-slow"></div>
        
        {/* Delicate grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" 
             style={{
               backgroundImage: `
                 linear-gradient(rgba(100,100,100,0.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(100,100,100,0.1) 1px, transparent 1px)
               `,
               backgroundSize: '64px 64px'
             }}>
        </div>
        
        {/* Soft radial overlay for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.08),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.08),transparent_50%)]"></div>
        
        {/* Subtle noise for texture */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
             }}>
        </div>
      </div>

      {/* Content */}
      <NexusProvider config={{ network: 'testnet' }}>
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header */}
          <Header />
          {/* Sidebar and Main content area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar - fixed positioned */}
            <Sidebar />
            {/* Main content area - offset for sidebar */}
            <main className="flex-1 w-full ml-20 p-2 lg:p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </NexusProvider>

      {/* Animated keyframes CSS */}
      <style>{`
        @keyframes float-gentle {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.05);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.98);
          }
        }
        
        .animate-float-gentle {
          animation: float-gentle 25s ease-in-out infinite;
        }
        
        .animate-float-gentle-delayed {
          animation: float-gentle 30s ease-in-out infinite;
          animation-delay: -8s;
        }
        
        .animate-float-gentle-slow {
          animation: float-gentle 35s ease-in-out infinite;
          animation-delay: -15s;
        }
      `}</style>
    </div>
  );
};