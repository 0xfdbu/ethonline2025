// src/App.tsx

import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import '@xyflow/react/dist/style.css';  // Import React Flow styles globally here (fixes error)

function App() {
  return (
    <ReactFlowProvider> 
      <MainLayout>
        <Home />
      </MainLayout>
    </ReactFlowProvider>
  );
}

export default App;