import React, { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';  // New: Zustand provider for React Flow
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';

function App() {
  const [isDark, setIsDark] = useState(true);

  // Dummy onDragStart prop (passed to layout; Home handles actual logic)
  const onDragStart = () => {};  // Placeholder; actual in Home/Sidebar

  return (
    <ReactFlowProvider>  // New: Wraps entire app for useReactFlow access
      <MainLayout
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
        onDragStart={onDragStart}
      >
        <Home />
      </MainLayout>
    </ReactFlowProvider>
  );
}

export default App;