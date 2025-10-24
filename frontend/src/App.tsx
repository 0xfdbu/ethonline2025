// src/App.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { Bridge } from './pages/Bridge';
import { Explorer } from './pages/Explorer';
import { Intents } from './pages/Intents';
import '@xyflow/react/dist/style.css'; // Import React Flow styles globally

function App() {
  return (
    <ReactFlowProvider>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bridge" element={<Bridge />} />
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/intents/:id" element={<Intents />} />
        </Routes>
      </MainLayout>
    </ReactFlowProvider>
  );
}

export default App;