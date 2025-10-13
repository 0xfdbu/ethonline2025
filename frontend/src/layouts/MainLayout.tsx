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
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10">
        {/* Primary gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20" />
        
        {/* Animated blurred orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-400/15 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="relative z-0 flex flex-col min-h-screen">
        {/* Header */}
        <Header />

        {/* Sidebar and Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - fixed positioned */}
          <Sidebar />

          {/* Main content area - offset for sidebar */}
          <main className="flex-1 w-full ml-20 p-2 lg:p-6 overflow-auto">
            <NexusProvider config={{ network: 'testnet' }}>
              {children}
            </NexusProvider>
          </main>
        </div>
      </div>

      {/* Add these styles to your global CSS or Tailwind config */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};