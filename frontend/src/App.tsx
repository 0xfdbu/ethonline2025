// src/App.tsx

import React, { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import '@xyflow/react/dist/style.css';  // Import React Flow styles globally here (fixes error)

function App() {
  const [isDark, setIsDark] = useState(true);

  return (
    <ReactFlowProvider>  // Root for all React Flow hooks
      <MainLayout
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
      >
        <Home />
      </MainLayout>
    </ReactFlowProvider>
  );
}

export default App;