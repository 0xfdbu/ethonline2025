// src/pages/Intents.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useNexus } from '@avail-project/nexus-widgets';
import { ArrowRight, CheckCircle, Clock as Hourglass, AlertCircle } from 'lucide-react';

interface Source {
  chainID?: number;
  tokenAddress?: string;
  universe?: string;
  value?: bigint;
}

interface Destination {
  chainID?: number;
  value?: bigint;
}

interface Intent {
  deposited: boolean;
  destinationChainID?: number;
  destinationUniverse?: string;
  destinations?: Destination[];
  expiry?: number;
  fulfilled?: boolean;
  id?: number;
  refunded?: boolean;
  sources?: Source[];
}

const tokenMap: Record<string, { symbol: string; image: string; decimals: number }> = {
  '0x0000000000000000000000000000000000000000': {
    symbol: 'ETH',
    image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    decimals: 18,
  },
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    symbol: 'USDC',
    image: 'https://assets.coingecko.com/coins/images/6319/small/usd-coin-circle-compass-logo.png',
    decimals: 6,
  },
  '0xdac17f958d2ee523a2206206994597c13d831ec7': {
    symbol: 'USDT',
    image: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
    decimals: 6,
  },
};

const getTokenInfo = (tokenAddress?: string): { symbol: string; image: string; decimals: number } => {
  if (!tokenAddress) {
    return tokenMap['0x0000000000000000000000000000000000000000'];
  }
  const address = tokenAddress.toLowerCase();
  return tokenMap[address] || tokenMap['0x0000000000000000000000000000000000000000'];
};

const formatDate = (timestamp: number | undefined): string => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp * 1000).toLocaleDateString() + ' ' + new Date(timestamp * 1000).toLocaleTimeString();
};

const formatBigIntAmount = (value: bigint | undefined, decimals = 18): string => {
  if (!value) return '0';
  const num = Number(value) / Math.pow(10, decimals);
  return num.toFixed(4);
};

const getStatusDisplay = (intent: Intent): string => {
  if (intent.fulfilled) return 'COMPLETED';
  if (intent.deposited) return 'PENDING';
  if (intent.refunded) return 'REFUNDED';
  return 'FAILED';
};

const getStatusColor = (intent: Intent): string => {
  if (intent.fulfilled) return 'green';
  if (intent.deposited) return 'yellow';
  if (intent.refunded) return 'blue';
  return 'red';
};

// Simple Visualizer for Intent Status (adapted from Bridge Visualizer)
const IntentVisualizer: React.FC<{ intent: Intent }> = ({ intent }) => {
  const sources = intent.sources || [];
  const destinations = intent.destinations || [];
  const tokenAddress = sources[0]?.tokenAddress;
  const tokenInfo = getTokenInfo(tokenAddress);
  const totalInput = sources.reduce((sum, src) => sum + (src.value || 0n), 0n);

  // Positions similar to Bridge Visualizer
  const sourcePositions = sources.map((src, i) => ({
    x: 100,
    y: 100 + i * 80,
    chainId: src.chainID || 0,
    amount: src.value || 0n,
  }));

  const destPosition = { 
    x: 900, 
    y: 240, 
    chainId: intent.destinationChainID || 0, 
    amount: destinations.reduce((sum, d) => sum + (d.value || 0n), 0n) 
  };

  const totalOutput = destPosition.amount;
  const statusColor = getStatusColor(intent);

  return (
    <div className="relative">
      <div className="p-6 relative overflow-hidden">
        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>

        {/* Main SVG */}
        <div className="w-full relative" style={{ height: '480px' }}>
          <svg viewBox="0 0 1000 480" className="w-full h-full">
            {/* Sources */}
            {sourcePositions.map((pos, i) => (
              <g key={i}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={30}
                  fill={`#10B981`}
                  stroke="#3B82F6"
                  strokeWidth="2"
                  filter="url(#shadow)"
                />
                <foreignObject x={pos.x - 15} y={pos.y - 15} width={30} height={30}>
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                    {pos.chainId || 'N/A'}
                  </div>
                </foreignObject>
                <text x={pos.x} y={pos.y + 45} textAnchor="middle" fill="#000000" fontSize="10" fontWeight="600">
                  {formatBigIntAmount(pos.amount, tokenInfo.decimals)} {tokenInfo.symbol}
                </text>
                {/* Path to bridge */}
                <path
                  d={`M ${pos.x + 30} ${pos.y} Q 350 240 400 240`}
                  stroke="#10B981"
                  strokeWidth="3"
                  fill="none"
                  markerEnd="url(#arrow-green)"
                />
              </g>
            ))}

            {/* Bridge Hub */}
            <circle cx={400} cy={240} r={40} fill="#F59E0B" stroke="#3B82F6" strokeWidth="2" />
            <text x={400} y={245} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">HUB</text>
            <text x={400} y={265} textAnchor="middle" fill="#000000" fontSize="10">
              {formatBigIntAmount(totalInput, tokenInfo.decimals)} {tokenInfo.symbol}
            </text>

            {/* Status indicator */}
            <circle cx={400} cy={300} r={20} fill={statusColor === 'green' ? '#10B981' : statusColor === 'yellow' ? '#F59E0B' : '#EF4444'} />
            <text x={400} y={305} textAnchor="middle" fill="white" fontSize="8">
              {getStatusDisplay(intent).slice(0, 3)}
            </text>

            {/* Path to destination */}
            <path
              d={`M 440 240 Q 700 240 850 240`}
              stroke="#059669"
              strokeWidth="3"
              fill="none"
              markerEnd="url(#arrow-blue)"
            />

            {/* Destination */}
            <circle cx={900} cy={240} r={35} fill="#059669" stroke="#3B82F6" strokeWidth="2" />
            <text x={900} y={245} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
              {destPosition.chainId || 'N/A'}
            </text>
            <text x={900} y={265} textAnchor="middle" fill="#000000" fontSize="10">
              {formatBigIntAmount(destPosition.amount, tokenInfo.decimals)} {tokenInfo.symbol}
            </text>

            {/* Arrows defs */}
            <defs>
              <marker id="arrow-green" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10B981" />
              </marker>
              <marker id="arrow-blue" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
              </marker>
              <filter id="shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
              </filter>
            </defs>
          </svg>
        </div>

        <div className="text-center mt-4">
          <p className="text-gray-900">Intent #{intent.id || 'N/A'} - {getStatusDisplay(intent)}</p>
          <p className="text-xs text-gray-600">Expiry: {formatDate(intent.expiry)}</p>
        </div>
      </div>
    </div>
  );
};

const Intents: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { sdk: nexus, isSdkInitialized } = useNexus();
  const [intent, setIntent] = useState<Intent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchIntent = useCallback(async (intentId: number) => {
    if (!nexus || !isSdkInitialized) return;
    setLoading(true);
    setError('');
    try {
      // Assuming SDK has getIntentById or similar; if not, refetch list and find
      // For now, simulate refetch of list and find
      const response = await nexus.getMyIntents({ limit: 50, offset: 0 });
      let intentList: Intent[] = [];
      if (Array.isArray(response)) {
        intentList = response;
      } else if (response && Array.isArray(response.intents)) {
        intentList = response.intents;
      }
      const foundIntent = intentList.find(i => i.id === intentId);
      if (foundIntent) {
        setIntent(foundIntent);
      } else {
        setError('Intent not found');
      }
    } catch (err: any) {
      console.error('Error fetching intent:', err);
      setError('Failed to load intent');
    } finally {
      setLoading(false);
    }
  }, [nexus, isSdkInitialized]);

  useEffect(() => {
    if (id) {
      fetchIntent(parseInt(id));
    }
  }, [id, fetchIntent]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col p-4 lg:p-8 relative min-h-screen items-center justify-center mt-5 lg:mt-10">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
          <span className="ml-2 text-gray-600">Loading intent...</span>
        </div>
      </div>
    );
  }

  if (error || !intent) {
    return (
      <div className="flex-1 flex flex-col p-4 lg:p-8 relative min-h-screen items-center justify-center mt-5 lg:mt-10">
        <div className="text-center py-12 text-gray-600">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{error || 'Intent not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-8 relative min-h-screen items-center justify-center mt-5 lg:mt-10">
      <div className="max-w-6xl mx-auto w-full">
        <IntentVisualizer intent={intent} />
      </div>
    </div>
  );
};

export { Intents };
export default Intents;