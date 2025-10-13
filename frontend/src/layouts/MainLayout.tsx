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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 flex flex-col">
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
  );
};