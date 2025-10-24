// src/pages/Explorer.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNexus } from '@avail-project/nexus-widgets';
import { useAccount } from 'wagmi';
import { Clock, CheckCircle, XCircle, Clock as Hourglass, AlertCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

const StatusIcon: React.FC<{ intent: Intent }> = ({ intent }) => {
  const color = getStatusColor(intent);
  switch (getStatusDisplay(intent)) {
    case 'COMPLETED':
      return <CheckCircle className={`w-5 h-5 text-${color}-500`} />;
    case 'PENDING':
      return <Hourglass className={`w-5 h-5 text-${color}-500`} />;
    case 'REFUNDED':
      return <ArrowRight className={`w-5 h-5 text-${color}-500`} />;
    default:
      return <XCircle className={`w-5 h-5 text-${color}-500`} />;
  }
};

const IntentCard: React.FC<{ intent: Intent; onClick: () => void }> = ({ intent, onClick }) => {
  const sources = intent.sources || [];
  const destinations = intent.destinations || [];
  const tokenAddress = sources[0]?.tokenAddress;
  const tokenInfo = getTokenInfo(tokenAddress);
  const totalInput = sources.reduce((sum, src) => sum + (src.value || 0n), 0n);
  const totalOutput = destinations.reduce((sum, dest) => sum + (dest.value || 0n), 0n);

  const sourceChainId = sources.length > 0 ? sources[0].chainID : undefined;
  const sourceCount = sources.length;

  return (
    <div 
      className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 space-y-4 cursor-pointer hover:bg-white/20 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusIcon intent={intent} />
          <span className="text-sm font-medium text-gray-700">
            {getStatusDisplay(intent)}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {formatDate(intent.expiry)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">From</span>
          <p className="font-semibold text-gray-900">
            {sourceChainId ? `Chain ${sourceChainId}` : 'N/A'} {sourceCount > 1 && `(+${sourceCount - 1})`}
          </p>
        </div>
        <div>
          <span className="text-gray-500">To</span>
          <p className="font-semibold text-gray-900">{intent.destinationChainID ? `Chain ${intent.destinationChainID}` : 'N/A'}</p>
        </div>
        <div>
          <span className="text-gray-500">Send</span>
          <p className="font-semibold text-gray-900 flex items-center gap-1">
            <img src={tokenInfo.image} alt={tokenInfo.symbol} className="w-4 h-4 rounded" />
            {formatBigIntAmount(totalInput, tokenInfo.decimals)} {tokenInfo.symbol}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Receive</span>
          <p className="font-semibold text-gray-900 flex items-center gap-1">
            <img src={tokenInfo.image} alt={tokenInfo.symbol} className="w-4 h-4 rounded" />
            {formatBigIntAmount(totalOutput, tokenInfo.decimals)} {tokenInfo.symbol}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Clock size={12} />
        <span>ID: {intent.id || 'N/A'}</span>
      </div>
    </div>
  );
};

const ExplorerList: React.FC = () => {
  const { sdk: nexus, isSdkInitialized } = useNexus();
  const { isConnected, address } = useAccount();
  const [intents, setIntents] = useState<Intent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchIntents = useCallback(async () => {
    if (!nexus || !isSdkInitialized || !isConnected || !address) return;
    setLoading(true);
    setError('');
    try {
      const response = await nexus.getMyIntents({ limit: 20, offset: 0 });
      console.log('getMyIntents response:', response);
      let intentList: Intent[] = [];
      if (Array.isArray(response)) {
        intentList = response;
      } else if (response && Array.isArray(response.intents)) {
        intentList = response.intents;
      } else if (response && response.data && Array.isArray(response.data)) {
        intentList = response.data;
      }
      intentList = intentList.filter(intent => intent && intent.id);
      setIntents(intentList);
    } catch (err: any) {
      console.error('Error fetching intents:', err);
      setError('Failed to load intents');
    } finally {
      setLoading(false);
    }
  }, [nexus, isSdkInitialized, isConnected, address]);

  useEffect(() => {
    fetchIntents();
  }, [fetchIntents]);

  const handleIntentClick = (intent: Intent) => {
    navigate(`/intents/${intent.id}`);
  };

  if (!isSdkInitialized || !isConnected) {
    return (
      <div className="flex-1 flex flex-col p-4 lg:p-8 relative min-h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Initializing...</h2>
          <p className="text-gray-600 mb-6">
            SDK: {isSdkInitialized ? 'Ready' : 'Loading'} | Wallet: {isConnected ? 'Connected' : 'Connect'}
          </p>
          <div className="w-8 h-8 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-8 relative min-h-screen items-center justify-center mt-5 lg:mt-10">
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Intent Explorer</h1>
        
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
            <span className="ml-2 text-gray-600">Loading intents...</span>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center mb-4">
            {error}
            <button
              onClick={fetchIntents}
              className="ml-2 underline hover:text-red-700"
            >
              Retry
            </button>
          </div>
        )}
        
        {!loading && intents.length === 0 && !error && (
          <div className="text-center py-12 text-gray-600">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No intents found.</p>
          </div>
        )}
        
        <div className="space-y-4">
          {intents.map((intent) => (
            <IntentCard key={intent.id} intent={intent} onClick={() => handleIntentClick(intent)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export function Explorer() {
  return <ExplorerList />;
}