import { useState, useCallback, useEffect } from 'react';
import type { Node, Edge } from '@xyflow/core';
import type { IntentStep } from '../types/intent';
import { NexusSDK } from '@avail-project/nexus-core';
import { useAccount, useWalletClient, useConnect } from 'wagmi'; // For wallet provider
import { ethers } from 'ethers';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'wagmi/chains';

export const useIntentSteps = () => {
  const [steps, setSteps] = useState<IntentStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [nexus, setNexus] = useState<NexusSDK | null>(null);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { open } = useConnect(); // Use Reown's open for modal

  // Initialize Nexus SDK on mount
  useEffect(() => {
    console.log('useEffect trigger - isConnected:', isConnected, 'walletClient:', !!walletClient, 'address:', address);
    if (isConnected && walletClient && address) {
      const initNexus = async () => {
        try {
          console.log('Initializing Nexus SDK...');
          const sdk = new NexusSDK({ network: 'testnet' });
          
          // Convert viem walletClient to ethers provider
          console.log('Creating ethers provider from walletClient...');
          const ethersProvider = new ethers.BrowserProvider(walletClient.transport, 'any');
          console.log('Ethers provider created');
          
          // Create EIP-1193 compatible wrapper with .request and .on
          const eip1193Provider = {
            request: async (args: { method: string; params?: any[] }) => {
              return await ethersProvider.send(args.method, args.params || []);
            },
            on: ethersProvider.on.bind(ethersProvider),
            removeListener: ethersProvider.removeListener.bind(ethersProvider),
            // Add if needed: enable: () => ethersProvider.listAccounts(),
          };
          
          // Initialize with the wrapped provider
          await sdk.initialize(eip1193Provider as any);
          setNexus(sdk);
          console.log('Nexus SDK initialized successfully');
        } catch (err) {
          console.error('Nexus init failed:', err);
          // Fallback: Set nexus to null, use local sim
        }
      };
      initNexus();
    } else {
      console.log('Wallet not connected or missing, skipping Nexus init');
    }
  }, [isConnected, walletClient, address]);

  // Check balance before sim (optional, to avoid prompts)
  const checkBalance = useCallback(async () => {
    if (!address) return false;
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http('https://ethereum-sepolia-rpc.publicnode.com'),
    });
    const balance = await publicClient.getBalance({ address });
    const ethBalance = ethers.formatEther(balance);
    console.log('Wallet balance:', ethBalance, 'ETH');
    return parseFloat(ethBalance) > 0.001; // Min 0.001 ETH
  }, [address]);

  const serializeSteps = useCallback((nodes: Node[], edges: Edge[]) => {
    // Traverse graph to build IntentStep[] from nodes/edges
    const stepMap: IntentStep[] = [];
    nodes.forEach((node) => {
      if (node.type !== 'start') { // Skip intent start
        stepMap.push({
          action: node.type as 'swap' | 'bridge',
          params: { 
            ...node.data.params, 
            tokenIn: node.data.params?.tokenIn,
            tokenOut: node.data.params?.tokenOut,
            fee: node.data.params?.fee,
            amountIn: node.data.params?.amountIn,
            toChainId: node.data.params?.toChainId,
            amount: node.data.params?.amount || 0.001, // Small default
            // Add more params from node data as needed
          },
        });
      }
    });
    // Sort by edges for sequence (simple linear for now)
    return stepMap;
  }, []);

  const localGasEstimate = useCallback(async (intentSteps: IntentStep[]) => {
    let gasTotal = 0n;
    const latencies: number[] = [];

    for (const step of intentSteps) {
      let stepGas: bigint;
      const startTime = Date.now();

      if (step.action === 'swap') {
        // Mock ethers gas est for fallback
        stepGas = 200000n; // Approx Uniswap swap
      } else if (step.action === 'bridge') {
        stepGas = 300000n; // Approx bridge
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
  }, []);

  const simulateIntent = useCallback(async (nodes: Node[], edges: Edge[]) => {
    console.log('simulateIntent called with nodes:', nodes.length, 'edges:', edges.length);
    
    if (!isConnected) {
      console.log('Not connected, opening Reown modal');
      open(); // Open Reown AppKit modal
      return;
    }
    if (!nexus) {
      console.warn('Nexus not initialized yet - using local estimation fallback');
      // Fallback local sim (ethers gas est)
      const intentSteps = serializeSteps(nodes, edges);
      const localSim = await localGasEstimate(intentSteps);
      return {
        steps: intentSteps,
        simulation: localSim,
      };
    }
    console.log('Nexus ready, proceeding with simulation');

    // Check balance before sim
    const hasBalance = await checkBalance();
    if (!hasBalance) {
      console.warn('Insufficient balance for simulation. Fund your wallet on Sepolia.');
      return;
    }

    setLoading(true);
    console.log('Starting simulation...');
    try {
      const intentSteps = serializeSteps(nodes, edges);
      console.log('Serialized intentSteps:', intentSteps);
      
      const bridgeStep = intentSteps.find(s => s.action === 'bridge');
      if (!bridgeStep) {
        console.error('No bridge step for simulation');
        throw new Error('No bridge step for simulation');
      }

      // Prepare Nexus params from steps (demo bridgeAndExecute flow)
      const nexusParams = {
        token: bridgeStep.params.token || 'USDC',
        amount: (bridgeStep.params.amount || 0.001).toString(), // Small amount
        toChainId: bridgeStep.params.toChainId || 84532, // Base Sepolia
        recipient: address!,
        sourceChains: [11155111], // From Sepolia
        waitForReceipt: true,
        requiredConfirmations: 1,
        execute: intentSteps.find(s => s.action === 'execute') ? {
          toChainId: bridgeStep.params.toChainId || 84532,
          contractAddress: '0x...real-vault-on-base-sepolia...', // Replace with real
          contractAbi: [ // Example ABI for deposit
            {
              inputs: [
                { internalType: 'uint256', name: 'assets', type: 'uint256' },
                { internalType: 'address', name: 'receiver', type: 'address' },
              ],
              name: 'deposit',
              outputs: [{ internalType: 'uint256', name: 'shares', type: 'uint256' }],
              stateMutability: 'nonpayable',
              type: 'function',
            },
          ],
          functionName: 'deposit',
          buildFunctionParams: (token: any, amount: string, chainId: number, userAddress: string) => {
            const decimals = 6; // USDC
            const amountWei = ethers.parseUnits(amount, decimals);
            return {
              functionParams: [amountWei, userAddress],
            };
          },
          tokenApproval: {
            token: bridgeStep.params.token || 'USDC',
            amount: (bridgeStep.params.amount || 0.001).toString(),
          },
        } : undefined,
      };

      console.log('Nexus params prepared:', nexusParams);

      // Simulate with Nexus SDK
      const simulation = await nexus.simulateBridgeAndExecute(nexusParams);
      console.log('Nexus simulation result:', simulation);
      
      if (simulation.success) {
        setSteps(intentSteps);
        const simResult = {
          steps: intentSteps,
          simulation: {
            gasEstimate: simulation.totalEstimatedCost?.gas.toString() || '0',
            latencyMs: simulation.steps.reduce((acc: number, step: any) => acc + (step.estimatedDuration || 0), 0),
            nexusSimulation: simulation,
          },
        };
        console.log('Simulation successful, result:', simResult);
        return simResult;
      } else {
        throw new Error(simulation.error || 'Simulation failed');
      }
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setLoading(false);
      console.log('Simulation complete');
    }
  }, [isConnected, nexus, address, open, serializeSteps, checkBalance]);

  const forgeIntent = useCallback(async (nodes: Node[], edges: Edge[]) => {
    // Reuse simulation for forge, or extend if needed
    return simulateIntent(nodes, edges);
  }, [simulateIntent]);

  return { steps, loading, simulateIntent, forgeIntent, serializeSteps };
};