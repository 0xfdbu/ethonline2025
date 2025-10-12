// frontend/src/pages/Home.tsx

import React, { useState } from 'react';
import { IntentVisualizer } from '../components/IntentVisualizer';
import { ResultsCard } from '../components/ResultsCard';
import { useIntentSteps } from '../hooks/useIntentSteps';
import type { Node, Edge } from '@xyflow/core';

export const Home: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [result, setResult] = useState<any>(null);
  const { loading, forgeIntent } = useIntentSteps();

  const handleNodesChange = (changes: any) => {
    setNodes((nds) => changes);
  };

  const handleEdgesChange = (changes: any) => {
    setEdges((eds) => changes);
  };

  const handleConnect = (connection: any) => {
    // Prod: Add edge logic
  };

  const handleNodesAdd = (newNode: Node) => {
    setNodes((nds) => [...nds, newNode]);
  };

  const handleForge = async () => {
    const forgeResult = await forgeIntent(nodes, edges);
    if (forgeResult) {
      setResult(forgeResult);
    }
  };

  return (
    <div className="min-h-screen to-black relative">
      <IntentVisualizer
        initialNodes={nodes}
        initialEdges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodesAdd={handleNodesAdd}
      />
      <div className="mt-4 flex gap-4 p-4">
        <button
          onClick={handleForge}
          disabled={loading || nodes.length < 2}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:from-cyan-600 disabled:opacity-50 transition-all"
        >
          {loading ? 'Forging...' : 'Forge Intent'}
        </button>
        <ResultsCard result={result} onRetry={handleForge} loading={loading} />
      </div>
    </div>
  );
};