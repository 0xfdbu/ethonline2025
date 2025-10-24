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

    </div>
  );
};