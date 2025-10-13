// src/App.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { MainLayout } from './layouts/MainLayout';
import { Visualizer } from './pages/Visualizer';
import { Bridge } from './pages/Bridge';
import '@xyflow/react/dist/style.css'; // Import React Flow styles globally

function App() {
  return (
    <ReactFlowProvider>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Bridge />} />
          <Route path="/visualizer" element={<Visualizer />} />
        </Routes>
      </MainLayout>
    </ReactFlowProvider>
  );
}

export default App;
