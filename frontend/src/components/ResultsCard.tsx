// frontend/src/components/ResultsCard.tsx

import React from 'react';
import type { SimulationResult, ForgeResult } from '../types/intent';

interface ResultsCardProps {
  result?: ForgeResult;
  onRetry: () => void;
  loading: boolean;
}

export const ResultsCard: React.FC<ResultsCardProps> = ({ result, onRetry, loading }) => {
  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
          <span className="text-cyan-400">Forging intent... Live sim on Sepolia</span>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const initialGas = parseInt(result.initialSim.gasEstimate);
  const optimizedGas = parseInt(result.optimizedSim.gasEstimate);
  const savings = result.gasSavings || '0';

  return (
    <div className="p-6 bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 rounded-xl shadow-xl border border-cyan-500/30">
      <h3 className="text-lg font-bold text-white mb-4">Forge Results</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-sm">
          <p className="text-gray-300">Initial Gas</p>
          <p className="text-white font-mono">{initialGas.toLocaleString()}</p>
        </div>
        <div className="text-sm">
          <p className="text-gray-300">Optimized Gas</p>
          <p className="text-white font-mono">{optimizedGas.toLocaleString()}</p>
        </div>
        <div className="text-sm col-span-2">
          <p className="text-gray-300">Savings</p>
          <p className="text-emerald-400 font-bold">{savings}% via ASI Agent</p>
        </div>
      </div>
      <div className="text-sm mb-4">
        <p className="text-gray-300">Latency</p>
        <p className="text-white font-mono">{result.optimizedSim.latencyMs}ms</p>
      </div>
      {result.execTxHash && (
        <a
          href={`https://sepolia.etherscan.io/tx/${result.execTxHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          View Tx on Etherscan
        </a>
      )}
      <button
        onClick={onRetry}
        className="ml-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
      >
        Retry Forge
      </button>
    </div>
  );
};