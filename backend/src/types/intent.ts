// backend/src/types/intent.ts

export interface IntentStep {
  action: 'swap' | 'bridge' | 'execute';
  params: {
    // Swap params
    tokenIn?: string;
    tokenOut?: string;
    fee?: number;
    amountIn?: string | number;
    amountOutMinimum?: bigint | string | number;
    sqrtPriceLimitX96?: bigint | string | number;
    recipient?: string;
    deadline?: number;
    // Bridge params
    token?: string;
    amount?: number | string;
    fromChainId?: number;
    toChainId?: number;
    to?: string;
    minGasLimit?: number;
    extraData?: string;
    value?: string | number;
    // Execute params
    contractAddress?: string;
    abi?: any[];
    functionName?: string;
    toToken?: string; // Legacy
  };
}

export interface SimulationResult {
  gasEstimate: string;
  latencyMs: number;
}

export interface ForgeResult {
  steps?: IntentStep[];
  simulation: SimulationResult;
  nexusDemo: {
    estimatedGas?: string;
    status: 'simulated' | 'failed';
    error?: string;
  };
  nexusParams?: any;
}