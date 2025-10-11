import React, { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { NexusProvider } from '@avail-project/nexus-widgets';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';

function App() {
  const [isDark, setIsDark] = useState(true);

  return (
    <ReactFlowProvider>  // Root for all React Flow hooks
      <NexusProvider config={{ network: 'testnet' }}>  // Root for Nexus widgets (CSS override expands width)
        <MainLayout
          isDark={isDark}
          onToggleDark={() => setIsDark(!isDark)}
        >
          <Home />
        </MainLayout>
      </NexusProvider>
    </ReactFlowProvider>
  );
}

export default App;