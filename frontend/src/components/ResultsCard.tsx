import React from 'react';
import type { ForgeResult } from '../types/intent';

interface ResultsCardProps {
  results: ForgeResult | null;
}

export const ResultsCard: React.FC<ResultsCardProps> = ({ results }) => {
  if (!results) return null;

  return (
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
  );
};