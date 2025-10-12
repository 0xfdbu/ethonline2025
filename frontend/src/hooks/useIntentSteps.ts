// frontend/src/hooks/useIntentSteps.ts

import { useState, useCallback } from 'react';
import type { Node, Edge } from '@xyflow/core';
import type { IntentStep } from '../types/intent';
import { useAccount, useConnect, useWalletClient } from 'wagmi'; // Use wagmi for prod wallet (RainbowKit compatible)

export const useIntentSteps = () => {
  const [steps, setSteps] = useState<IntentStep[]>([]);
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { data: walletClient } = useWalletClient();

  const serializeSteps = useCallback((nodes: Node[], edges: Edge[]) => {
    // Prod: Traverse graph to build IntentStep[] from nodes/edges
    const stepMap: IntentStep[] = [];
    nodes.forEach((node) => {
      if (node.type !== 'start') { // Skip intent start
        stepMap.push({
          action: node.type as 'swap' | 'bridge', // 'swap' or 'bridge'
          params: { 
            ...node.data, 
            tokenIn: node.data.tokenIn,
            tokenOut: node.data.tokenOut,
            // Add more params from node data
          },
        });
      }
    });
    // Sort by edges for sequence (simple linear for now)
    return stepMap;
  }, []);

  const forgeIntent = useCallback(async (nodes: Node[], edges: Edge[]) => {
    if (!isConnected) {
      connect({ connector: undefined }); // Prompt wallet connect
      return;
    }

    setLoading(true);
    try {
      const intentSteps = serializeSteps(nodes, edges);
      // Get signer address
      const signer = address;
      const response = await fetch('/api/forge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps: intentSteps, signer }),
      });
      if (!response.ok) throw new Error('Forge failed');
      const result = await response.json();
      setSteps(result.optimizedSteps);
      return result;
    } catch (error) {
      console.error('Forge failed:', error);
    } finally {
      setLoading(false);
    }
  }, [isConnected, connect, address, serializeSteps]);

  return { steps, loading, forgeIntent, serializeSteps };
};