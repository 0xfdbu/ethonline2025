// src/layouts/MainLayout.tsx
import React from 'react';
import { NexusProvider } from '@avail-project/nexus-widgets';
import Sidebar from '../components/MainLayout/Sidebar';
import Header from '../components/MainLayout/Header';
import { NexusInitializer } from '../components/NexusInitializer'; // Import new component

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      <NexusProvider config={{ network: 'testnet' }}>
        {/* Place the initializer here so it runs once and centrally */}
        <NexusInitializer /> 
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header */}
          <Header />
          {/* Sidebar and Main content area */}
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main
              className="flex-1 w-full overflow-auto p-2 lg:p-6 mt-10"
              style={{ marginLeft: window.innerWidth >= 768 ? '80px' : '0', marginBottom: window.innerWidth < 768 ? '64px' : '0' }}
            >
              {children}
            </main>
          </div>
        </div>
      </NexusProvider>
    </div>
  );
};