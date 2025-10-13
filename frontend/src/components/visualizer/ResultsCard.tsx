// frontend/src/components/ResultsCard.tsx

import React from 'react';
import type { SimulationResult, ForgeResult } from '../../types/intent';

interface ResultsCardProps {
  result?: ForgeResult & { error?: string }; // Extended with optional error
  onRetry: () => void;
  loading: boolean;
}

export const ResultsCard: React.FC<ResultsCardProps> = ({ result, onRetry, loading }) => {
  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
          <span className="text-cyan-400">Simulating intent... Live on Sepolia</span>
        </div>
      </div>
    );
  }

  if (!result) return null;

  if (result.error) {
    return (
      <div className="p-6 bg-gradient-to-br from-red-900/20 to-red-500/20 rounded-xl shadow-xl border border-red-500/30">
        <h3 className="text-lg font-bold text-white mb-4">Simulation Error</h3>
        <p className="text-red-300 mb-4">{result.error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { simulation } = result;
  const gas = parseInt(simulation.gasEstimate);
  const latency = simulation.latencyMs;

  console.log('ResultsCard render:', result);

  return (
    <div className="p-6 bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 rounded-xl shadow-xl border border-cyan-500/30">
      <h3 className="text-lg font-bold text-white mb-4">Simulation Results</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-sm">
          <p className="text-gray-300">Estimated Gas</p>
          <p className="text-white font-mono">{gas.toLocaleString()}</p>
        </div>
        <div className="text-sm">
          <p className="text-gray-300">Latency</p>
          <p className="text-white font-mono">{latency}ms</p>
        </div>
      </div>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
      >
        Re-Simulate
      </button>
    </div>
  );
};