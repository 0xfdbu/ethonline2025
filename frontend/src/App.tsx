// src/App.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { MainLayout } from './layouts/MainLayout';
import { Bridge } from './pages/Bridge';
import { Explorer } from './pages/Explorer';
import '@xyflow/react/dist/style.css'; // Import React Flow styles globally

function App() {
  return (
    <ReactFlowProvider>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Bridge />} />
          <Route path="/explorer" element={<Explorer />} />
        </Routes>
      </MainLayout>
    </ReactFlowProvider>
  );
}

export default App;