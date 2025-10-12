import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import type { IntentStep, SimulationResult, ForgeResult } from './types/intent';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());  // Built-in JSON parser

// Test wallet private key (replace with env var for security)
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Hardhat default
const wallet = new ethers.Wallet(PRIVATE_KEY);
const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.org');
const signer = wallet.connect(provider);

// Uniswap-like swap router for gas est (example)
const SWAP_ROUTER_ADDRESS = '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E';
const SWAP_ABI = [
  'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)'
] as const;
const swapRouter = new ethers.Contract(SWAP_ROUTER_ADDRESS, SWAP_ABI, provider);

// Bridge contract example (Optimism L1StandardBridge on Sepolia)
const BRIDGE_ADDRESS = '0x5086d1eEF304eb5284A0f6720f79403b4e9beD98';
const BRIDGE_ABI = [
  'function depositETHTo(address _to, uint32 _minGasLimit, bytes calldata _extraData) external payable'
] as const;
const bridgeContract = new ethers.Contract(BRIDGE_ADDRESS, BRIDGE_ABI, provider);

const DUMMY_FROM = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

// Core Endpoint: POST /api/forge
app.post('/api/forge', async (req, res) => {
  try {
    const userSteps: IntentStep[] = req.body;
    if (!Array.isArray(userSteps) || userSteps.length === 0) {
      return res.status(400).json({ error: 'Invalid steps array' });
    }

    console.log('Received steps:', userSteps);

    // Step 1: Real Simulation
    const simResult = await simulateSteps(userSteps, provider);

    // Return ForgeResult (simulation focused)
    const result: ForgeResult = {
      steps: userSteps,
      simulation: simResult,
    };
    console.log('Returning simulation result:', result);
    res.json(result);
  } catch (error) {
    console.error('Forge error:', error);
    res.status(500).json({ error: 'Internal server error - check logs' });
  }
});

// Real Simulation using ethers gas estimates
async function simulateSteps(
  steps: IntentStep[],
  provider: ethers.JsonRpcProvider
): Promise<SimulationResult> {
  let gasTotal = 0n;
  const latencies: number[] = [];

  for (const step of steps) {
    let stepGas: bigint;
    const startTime = Date.now();

    if (step.action === 'swap') {
      // Real swap gas est
      const params = {
        tokenIn: step.params.tokenIn || '0x7b79995e5f793A07Bc00c21412e50E7E7E61f89d', // WETH Sepolia
        tokenOut: step.params.tokenOut || '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC
        fee: step.params.fee || 3000,
        recipient: DUMMY_FROM,
        deadline: Math.floor(Date.now() / 1000) + 1800,
        amountIn: ethers.parseEther(step.params.amountIn?.toString() || '0.1'),
        amountOutMinimum: 0n,
        sqrtPriceLimitX96: 0n,
      };

      try {
        const tx = await swapRouter.exactInputSingle.populateTransaction(params);
        stepGas = await provider.estimateGas({ 
          to: SWAP_ROUTER_ADDRESS, 
          data: tx.data, 
          from: DUMMY_FROM, 
          value: params.amountIn 
        });
      } catch (err) {
        console.warn('Swap gas est failed:', err);
        stepGas = 200000n;
      }
    } else if (step.action === 'bridge') {
      // Real bridge gas est
      const to = step.params.to || DUMMY_FROM;
      const minGasLimit = step.params.minGasLimit || 200000;
      const extraData = step.params.extraData || '0x';
      const value = ethers.parseEther(step.params.value?.toString() || '0.01');

      try {
        const tx = await bridgeContract.depositETHTo.populateTransaction(to, minGasLimit, extraData);
        stepGas = await provider.estimateGas({ 
          to: BRIDGE_ADDRESS, 
          data: tx.data, 
          from: DUMMY_FROM, 
          value 
        });
      } catch (err) {
        console.warn('Bridge gas est failed:', err);
        stepGas = 300000n;
      }
    } else {
      stepGas = 21000n; // Base tx
    }

    const latency = Date.now() - startTime;
    gasTotal += stepGas;
    latencies.push(latency);
  }

  return {
    gasEstimate: gasTotal.toString(),
    latencyMs: latencies.reduce((a, b) => a + b, 0),
  };
}

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'Simulation Ready' }));

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});