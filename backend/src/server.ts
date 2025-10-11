import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import type { IntentStep, SimulationResult, ForgeResult } from './types/intent';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Core Endpoint: POST /api/forge
app.post('/api/forge', async (req, res) => {
  try {
    const userSteps: IntentStep[] = req.body;
    if (!Array.isArray(userSteps) || userSteps.length === 0) {
      return res.status(400).json({ error: 'Invalid steps array' });
    }

    console.log('Received steps:', userSteps);  // Debug log

    // Step 1: Hardcoded Mock Price (ETH/USD = $3000; replace with real Pyth/ASI later)
    const ethPrice = 3000;
    console.log('Mock ETH price:', ethPrice);

    // Step 2: Initial Simulation (pure mock, no ethers)
    const initialSim = await simulateStepsOnHardhat(userSteps, ethPrice, false);

    // Step 3: Mock ASI AI Optimization (e.g., reroute for efficiency)
    const optimizedSteps = await mockAsiOptimization(userSteps, ethPrice);

    // Step 4: Re-Simulate Optimized Steps
    const optimizedSim = await simulateStepsOnHardhat(optimizedSteps, ethPrice, true);

    // Return ForgeResult
    const result: ForgeResult = {
      optimizedSteps,
      initialSim,
      optimizedSim,
    };
    console.log('Returning result:', result);  // Debug log
    res.json(result);
  } catch (error) {
    console.error('Forge error:', error);  // Better logging
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    res.status(500).json({ error: 'Internal server error - check logs' });
  }
});

// Pure Mock Simulation Helper (no external deps)
async function simulateStepsOnHardhat(
  steps: IntentStep[],
  ethPrice: number,
  isOptimized: boolean
): Promise<SimulationResult> {
  let gasTotal = 0n;
  for (const step of steps) {
    // Mock condition: Skip swap if ETH low
    if (step.action === 'swap' && ethPrice < 2500) continue;

    // Mock tx: Estimate gas (base + step-specific; 20% less if optimized)
    const baseGas = 21000n; // Simple transfer base
    let stepGas = step.action === 'bridge' ? 150000n : 100000n;
    if (isOptimized) stepGas = (stepGas * 80n) / 100n; // 20% savings
    gasTotal += baseGas + stepGas;
  }
  return {
    gasEstimate: gasTotal.toString(),
    latencyMs: steps.length * 500 + Math.random() * 1000, // Mock 0.5s/step + variance
  };
}

// Mock ASI Optimization (simple reroute logic; expand to real uAgents/MeTTa)
async function mockAsiOptimization(steps: IntentStep[], ethPrice: number): Promise<IntentStep[]> {
  // Example: If bridge from Polygon, optimize to Arbitrum if cheaper (mock)
  const optimized = steps.map((step) => {
    if (step.action === 'bridge' && step.params?.fromChainId === 80002) {
      return {
        ...step,
        params: { ...step.params, toChainId: 421614 }, // Switch to Arbitrum Sepolia
      };
    }
    if (step.action === 'swap' && ethPrice > 3000) {
      return { ...step, action: 'stake', params: { ...step.params, protocol: 'Aave' } }; // Upgrade to stake
    }
    return step;
  });
  console.log('ASI Mock: Optimized', optimized.length, 'steps');
  return optimized;
}

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});