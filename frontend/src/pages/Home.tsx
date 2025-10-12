// pages/Home.tsx

import React, { useState, useCallback, useEffect } from 'react';
import type { Node, Edge, Connection } from '@xyflow/core';
import type { ForgeResult } from '../types/intent';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import { IntentVisualizer } from '../components/IntentVisualizer';
import { ResultsCard } from '../components/ResultsCard';
import { useIntentSteps } from '../hooks/useIntentSteps';
import { Zap, Sparkles, Code2, Workflow } from 'lucide-react';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start Intent' },
    position: { x: 250, y: 25 },
    style: { background: 'rgba(30, 64, 175, 0.8)', color: 'white', backdropFilter: 'blur(10px)' },
  },
];

const initialEdges: Edge[] = [];

export const Home: React.FC = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [results, setResults] = useState<ForgeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'composer' | 'preview'>('composer');
  const [showParticles, setShowParticles] = useState(true);
  const { steps, updateStepsFromNodes } = useIntentSteps(nodes);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [],
  );
  const onNodesAdd = useCallback((newNode: Node) => setNodes((nds) => [...nds, newNode]), []);

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
    <div className="relative w-full min-h-screen overflow-hidden">


      {/* Main Content */}
      <div className="relative z-10 w-full mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-12 space-y-4">
          {/* Stats Bar */}
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="glass px-4 py-2 rounded-lg border border-white/10 backdrop-blur-xl">
              <div className="text-xs text-gray-400 font-mono">Active Steps</div>
              <div className="text-2xl font-bold text-cyan-400 font-mono">{steps.length}</div>
            </div>
            <div className="glass px-4 py-2 rounded-lg border border-white/10 backdrop-blur-xl">
              <div className="text-xs text-gray-400 font-mono">Nodes</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">{nodes.length}</div>
            </div>
            <div className="glass px-4 py-2 rounded-lg border border-white/10 backdrop-blur-xl">
              <div className="text-xs text-gray-400 font-mono">Connections</div>
              <div className="text-2xl font-bold text-blue-400 font-mono">{edges.length}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-lg backdrop-blur-xl border border-white/10 w-fit">
          <button
            onClick={() => setActiveTab('composer')}
            className={`px-6 py-2 rounded-lg font-mono text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'composer'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Workflow className="w-4 h-4" />
            Composer
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-6 py-2 rounded-lg font-mono text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'preview'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/50'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Preview
          </button>
        </div>

        {/* Content Sections */}
        {activeTab === 'composer' && (
          <div className="space-y-6">
            <div className="glass rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
              <IntentVisualizer
                initialNodes={nodes}
                initialEdges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodesAdd={onNodesAdd}
              />
            </div>

            <div className="text-sm text-gray-400 font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Drag components from sidebar to canvas • Connect nodes to build workflows
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="space-y-6">
            {steps.length > 0 ? (
              <div className="glass rounded-2xl border border-white/10 backdrop-blur-xl p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Code2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-mono font-bold text-emerald-300">Workflow Steps</h3>
                </div>
                <pre className="bg-black/30 rounded-lg p-4 overflow-auto max-h-96 font-mono text-xs text-gray-300 border border-white/5">
                  {JSON.stringify(steps, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="glass rounded-2xl border border-white/10 backdrop-blur-xl p-12 shadow-2xl flex items-center justify-center min-h-96">
                <div className="text-center">
                  <Workflow className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 font-mono">No steps composed yet. Create your workflow to see the preview.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div className="mt-8">
            <ResultsCard results={results} />
          </div>
        )}

        {/* Action Button */}
        <div className="mt-12 flex justify-center">
          <div className="relative group">
            <button
              onClick={onCompose}
              disabled={loading || steps.length === 0}
              className="relative px-8 py-4 font-mono font-bold text-lg text-white rounded-xl overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 hover:scale-105 active:scale-95"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-500 opacity-100 group-hover:opacity-110 transition-opacity"></div>
              
              {/* Animated border */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
                backgroundSize: '200% 200%',
                animation: 'shimmer 3s infinite'
              }}></div>

              {/* Content */}
              <div className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Forging Intents...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Simulate, Optimize & Execute
                  </>
                )}
              </div>
            </button>

            {/* Glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
      `}</style>
    </div>
  );
};