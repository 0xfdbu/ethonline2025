import React, { useState, useCallback, useEffect } from 'react';
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge 
} from '@xyflow/react';  // v12.8.6: Components/hooks/utils
import type { Node, Edge, Connection } from '@xyflow/core';  // v12.8.6: Types only
import { NexusProvider } from '@avail-project/nexus-widgets';
import type { IntentStep, ForgeResult } from './types/intent';  // Type-only import for interfaces
import '@xyflow/react/dist/style.css';  // Mandatory CSS
import './App.css';  // Optional custom CSS

// Sample initial nodes and edges for demo
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start Intent' },
    position: { x: 250, y: 25 },
    style: { background: '#1e40af', color: 'white' }, // Nexus blue
  },
  {
    id: '2',
    data: { label: 'Bridge USDC' },
    position: { x: 100, y: 100 },
    style: { background: '#10b981', color: 'white' }, // Green for actions
  },
  {
    id: '3',
    data: { label: 'Swap to ETH' },
    position: { x: 400, y: 100 },
    style: { background: '#10b981', color: 'white' },
  },
];

const initialEdges: Edge[] = [  // Typed as Edge[]
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [steps, setSteps] = useState<IntentStep[]>([
    { id: '2', action: 'bridge', params: { token: 'USDC', amount: 100, fromChainId: 80002, toChainId: 84532 } },
    { id: '3', action: 'swap', params: { toToken: 'ETH' } },
  ]);
  const [results, setResults] = useState<ForgeResult | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(false);

  // Update steps from nodes (simplified; map node labels to steps)
  const updateStepsFromNodes = useCallback(() => {
    const newSteps: IntentStep[] = nodes
      .filter((node) => node.data.label !== 'Start Intent')
      .map((node) => ({
        id: node.id,
        action: node.data.label.toLowerCase().includes('bridge') ? 'bridge' : 'swap',
        params: node.data.label.toLowerCase().includes('bridge')
          ? { token: 'USDC', amount: 100, fromChainId: 80002, toChainId: 84532 }
          : { toToken: 'ETH' },
      }));
    setSteps(newSteps);
  }, [nodes]);

  // Real-time sync: Update steps on node/edge changes
  useEffect(() => {
    updateStepsFromNodes();
  }, [nodes, edges, updateStepsFromNodes]);

  // On connect: Add edge and update steps
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  // Trigger backend forge
  const onCompose = async () => {
    setLoading(true);
    updateStepsFromNodes(); // Sync steps
    try {
      const response = await fetch('/api/forge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(steps),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data: ForgeResult = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Forge error:', error);
      alert(`Optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}. Check console/backend.`);
    }
    setLoading(false);
  };

  return (
    <NexusProvider config={{ network: 'testnet' }}>
      <div className={`min-h-screen ${isDark ? 'dark bg-gray-900' : 'bg-white'} transition-colors duration-300`}>
        {/* Header */}
        <header className="bg-gradient-to-r from-nexus-blue to-indigo-600 text-white p-4 shadow-lg">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold">Intent Forge</h1>
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-4">
          {/* Composer Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Drag & Drop Intent Composer
            </h2>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800">
              <div className="h-96 relative">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  fitView
                  className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900"
                >
                  <MiniMap />
                  <Controls />
                  <Background variant="dots" gap={12} size={1} />
                </ReactFlow>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Composed Steps: {steps.length} | Drag nodes to build flows (e.g., Bridge → Swap)
            </p>
            {/* Step Preview Card */}
            {steps.length > 0 && (
              <details className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
                <summary>Current Steps Preview</summary>
                <pre className="mt-2 overflow-auto">{JSON.stringify(steps, null, 2)}</pre>
              </details>
            )}
          </section>

          {/* Action Button */}
          <div className="flex justify-center mb-8">
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

          {/* Results Card */}
          {results && (
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Optimization Results</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Initial Simulation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gas: {results.initialSim.gasEstimate}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Latency: {results.initialSim.latencyMs}ms</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Optimized</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gas: {results.optimizedSim.gasEstimate}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Latency: {results.optimizedSim.latencyMs}ms</p>
                </div>
              </div>
              <details className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <summary>View Optimized Steps</summary>
                <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded overflow-auto">
                  {JSON.stringify(results.optimizedSteps, null, 2)}
                </pre>
              </details>
            </section>
          )}
        </div>
      </div>
    </NexusProvider>
  );
}

export default App;