// src/App.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { MainLayout } from './layouts/MainLayout';
import { Visualizer } from './pages/Visualizer';
import { Home } from './pages/Home';
import '@xyflow/react/dist/style.css'; // Import React Flow styles globally

function App() {
  return (
    <ReactFlowProvider>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/visualizer" element={<Visualizer />} />
        </Routes>
      </MainLayout>
    </ReactFlowProvider>
  );
}

export default App;
