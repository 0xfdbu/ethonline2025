import React from 'react';
import type { ForgeResult } from '../types/intent';

interface ResultsCardProps {
  results: ForgeResult | null;
}

export const ResultsCard: React.FC<ResultsCardProps> = ({ results }) => {
  if (!results) return null;

  return (
    <section className="glass rounded-lg shadow-xl p-6 w-full border border-neon-cyan/20 backdrop-blur-sm">
      <h2 className="text-xl font-semibold mb-4 text-neon-cyan font-mono">Optimization Results</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass p-3 rounded border border-white/10">
          <h3 className="font-medium mb-2 text-crypto-emerald">Initial Simulation</h3>
          <p className="text-sm text-gray-300">Gas: {results.initialSim.gasEstimate}</p>
          <p className="text-sm text-gray-300">Latency: {results.initialSim.latencyMs}ms</p>
        </div>
        <div className="glass p-3 rounded border border-white/10">
          <h3 className="font-medium mb-2 text-crypto-emerald">Optimized</h3>
          <p className="text-sm text-gray-300">Gas: {results.optimizedSim.gasEstimate}</p>
          <p className="text-sm text-gray-300">Latency: {results.optimizedSim.latencyMs}ms</p>
        </div>
      </div>
      <details className="mt-4 text-sm text-gray-300">
        <summary className="cursor-pointer font-mono hover:text-neon-cyan transition-colors">View Optimized Steps</summary>
        <pre className="mt-2 p-3 glass rounded border border-white/10 overflow-auto font-mono text-xs">
          {JSON.stringify(results.optimizedSteps, null, 2)}
        </pre>
      </details>
    </section>
  );
};