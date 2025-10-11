import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ethers } from 'ethers';
import { PythHttpClient } from '@pythnetwork/client';
import type { IntentStep, SimulationResult, ForgeResult } from './types/intent';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Mock Pyth Client (latest v2.1 as of Oct 2025)
const pythClient = new PythHttpClient('https://hermes.pyth.network');

// Mock Hardhat signer/provider (for sims; expand to real fork later)
const mockProvider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/YOUR_INFURA_KEY'); // Replace with key
const mockSigner = ethers.Wallet.createRandom().connect(mockProvider);

// Core Endpoint: POST /api/forge
app.post('/api/forge', async (req, res) => {
  try {
    const userSteps: IntentStep[] = req.body;
    if (!Array.isArray(userSteps) || userSteps.length === 0) {
      return res.status(400).json({ error: 'Invalid steps array' });
    }

    // Step 1: Mock Pyth Price Pull (e.g., ETH/USD)
    const priceFeeds = await pythClient.getLatestPrices(['Crypto.ETH/USD']);
    const ethPrice = priceFeeds[0]?.price || 3000; // Fallback mock

    // Step 2: Initial Hardhat Simulation (mock gas/latency per step)
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
    res.json(result);
  } catch (error) {
    console.error('Forge error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mock Hardhat Simulation Helper (ethers-based gas estimates)
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
    const tx = { gasLimit: baseGas + stepGas };
    gasTotal += tx.gasLimit;
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