import React, { useState } from 'react';
import type { Node, Edge, Connection } from '@xyflow/core';
import type { ForgeResult } from '../types/intent';
import { addEdge } from '@xyflow/react';
import { Composer } from '../components/Composer';
import { ResultsCard } from '../components/ResultsCard';
import { useIntentSteps } from '../hooks/useIntentSteps';

// Initial setup (only Start Intent node)
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start Intent' },
    position: { x: 250, y: 25 },
    style: { background: '#1e40af', color: 'white' },
  },
];

const initialEdges: Edge[] = [];

export const Home: React.FC = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [results, setResults] = useState<ForgeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { steps, updateStepsFromNodes } = useIntentSteps(nodes);

  const onNodesChange = (changes: any) => setNodes((nds) => changes(nds));
  const onEdgesChange = (changes: any) => setEdges((eds) => changes(eds));
  const onConnect = (connection: Connection) => setEdges((eds) => addEdge(connection, eds));

  const onCompose = async () => {
    setLoading(true);
    updateStepsFromNodes();
    try {
      const response = await fetch('/api/forge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(steps),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data: ForgeResult = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Forge error:', error);
      alert(`Optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}. Check console/backend.`);
    }
    setLoading(false);
  };

  return (
    <section className="w-full mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Drag & Drop Intent Composer
      </h2>
      <Composer
        initialNodes={nodes}
        initialEdges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      />
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        Composed Steps: {steps.length} | Drag from sidebar to canvas
      </p>
      {steps.length > 0 && (
        <details className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
          <summary>Current Steps Preview</summary>
          <pre className="mt-2 overflow-auto">{JSON.stringify(steps, null, 2)}</pre>
        </details>
      )}
      <div className="flex justify-center mb-8 mt-4">
        <button
          onClick={onCompose}
          disabled={loading || steps.length === 0}
          className="px-6 py-3 bg-nexus-blue text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {loading ? 'Optimizing...' : 'Simulate, Optimize & Execute'}
        </button>
      </div>
      <ResultsCard results={results} />
    </section>
  );
};