import { useState, useCallback, useEffect } from 'react';
import type { Node } from '@xyflow/core';
import type { IntentStep } from '../types/intent';

export const useIntentSteps = (nodes: Node[]) => {
  const [steps, setSteps] = useState<IntentStep[]>([]);

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

  useEffect(() => {
    updateStepsFromNodes();
  }, [nodes, updateStepsFromNodes]);

  return { steps, updateStepsFromNodes };
};