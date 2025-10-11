export interface IntentStep {
    id: string;
    action: string; // e.g., 'bridge', 'swap'
    params: {
      token?: string;
      amount?: number;
      fromChainId?: number;
      toChainId?: number;
      toToken?: string;
    };
  }
  
  export interface SimulationResult {
    gasEstimate: string;
    latencyMs: number;
  }
  
  export interface ForgeResult {
    optimizedSteps: IntentStep[];
    initialSim: SimulationResult;
    optimizedSim: SimulationResult;
  }