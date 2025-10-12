// layouts/MainLayout.tsx

import React from 'react';
import { NexusProvider } from '@avail-project/nexus-widgets';
import { Header } from '../components/Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
}) => {
  return (
    <div className="min-h-screen w-full transition-colors duration-300 flex flex-col w-full">
      <Header />
      <div className="flex-1 w-full overflow-hidden">
        <div className="flex-1 relative">
          <main className="flex-1 w-full p-2 lg:p-6 overflow-auto">
            <NexusProvider config={{ network: 'testnet' }}>
              {children}
            </NexusProvider>
          </main>
        </div>
      </div>
    </div>
  );
};