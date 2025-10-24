// src/pages/Intents.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNexus } from '@avail-project/nexus-widgets';
import { CheckCircle, Clock as Hourglass, AlertCircle, XCircle, ArrowRight, Clock, ChevronLeft } from 'lucide-react';
import { networks } from '../utils/bridge/bridgeConstants';

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

const getNetworkInfo = (chainId: number | undefined) => {
  if (!chainId) return null;
  const idStr = chainId.toString();
  return networks.find(n => n.id === idStr) || null;
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

const getStatusConfig = (intent: Intent): { color: string; bg: string; icon: React.ReactNode } => {
  if (intent.fulfilled) return {
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    icon: <CheckCircle className="w-4 h-4" />
  };
  if (intent.deposited) return {
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    icon: <Hourglass className="w-4 h-4 animate-pulse" />
  };
  if (intent.refunded) return {
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    icon: <ArrowRight className="w-4 h-4" />
  };
  return {
    color: 'text-red-600',
    bg: 'bg-red-50',
    icon: <XCircle className="w-4 h-4" />
  };
};

const FromDisplay: React.FC<{
  sources: Source[];
  tokenInfo: { symbol: string; image: string; decimals: number };
}> = ({
  sources,
  tokenInfo,
}) => {
  const totalInput = sources.reduce((sum, src) => sum + (src.value || 0n), 0n);
  const primarySource = sources[0];
  const fromNetwork = getNetworkInfo(primarySource?.chainID);

  return (
    <div className="flex-1 bg-white/15 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-4 space-y-3 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Sources</span>
        <span className="text-xs text-slate-500 font-medium">
          {sources.length} Chain{sources.length > 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex justify-between items-center gap-3">
        <div className="text-3xl font-bold text-slate-900 rounded-lg text-center">
          {formatBigIntAmount(totalInput, tokenInfo.decimals)}
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-white/60 hover:bg-white/90 border border-slate-200/50 rounded-xl transition-all">
          <img 
            src={tokenInfo.image} 
            alt={tokenInfo.symbol} 
            className="w-6 h-6 rounded-full shadow-lg" 
          />
          <span className="font-semibold text-slate-900 text-sm">{tokenInfo.symbol}</span>
        </div>
      </div>
      <div className="space-y-1">
        {sources.map((src, i) => {
          const net = getNetworkInfo(src.chainID);
          return (
            <div key={i} className="flex items-center justify-between text-xs text-slate-500">
              <span className="truncate">
                {net ? net.name : `Chain ${src.chainID}`}
              </span>
              <span>{formatBigIntAmount(src.value, tokenInfo.decimals)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ToDisplay: React.FC<{
  destinations: Destination[];
  tokenInfo: { symbol: string; image: string; decimals: number };
}> = ({
  destinations,
  tokenInfo,
}) => {
  const totalOutput = destinations.reduce((sum, dest) => sum + (dest.value || 0n), 0n);
  const primaryDest = destinations[0];
  const toNetwork = getNetworkInfo(primaryDest?.chainID);

  return (
    <div className="flex-1 bg-white/15 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-4 space-y-3 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Destinations</span>
        <span className="text-xs text-slate-500 font-medium">
          {destinations.length} Chain{destinations.length > 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex justify-between items-center gap-3">
        <div className="text-3xl font-bold text-slate-900 rounded-lg text-center">
          {formatBigIntAmount(totalOutput, tokenInfo.decimals)}
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-white/60 hover:bg-white/90 border border-slate-200/50 rounded-xl transition-all">
          <img 
            src={tokenInfo.image} 
            alt={tokenInfo.symbol} 
            className="w-6 h-6 rounded-full shadow-lg" 
          />
          <span className="font-semibold text-slate-900 text-sm">{tokenInfo.symbol}</span>
        </div>
      </div>
      <div className="space-y-1">
        {destinations.map((dest, i) => {
          const net = getNetworkInfo(dest.chainID);
          return (
            <div key={i} className="flex items-center justify-between text-xs text-slate-500">
              <span className="truncate">
                {net ? net.name : `Chain ${dest.chainID}`}
              </span>
              <span>{formatBigIntAmount(dest.value, tokenInfo.decimals)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Intents: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sdk: nexus, isSdkInitialized } = useNexus();
  const [intent, setIntent] = useState<Intent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchIntent = useCallback(async (intentId: number) => {
    if (!nexus || !isSdkInitialized) return;
    setLoading(true);
    setError('');
    try {
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
      <div className="flex-1 flex flex-col p-4 lg:p-8 relative min-h-screen items-center justify-center">
        <div className="text-center max-w-md bg-white/15 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-8">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-lg">
              <Clock className="w-8 h-8 text-gray-700" />
            </div>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
            Loading Intent...
          </h2>
          <p className="text-gray-600 mb-6">
            Fetching details for Intent #{id}
          </p>
          <div className="w-10 h-10 border-3 border-gray-300 border-t-gray-700 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !intent) {
    return (
      <div className="flex-1 flex flex-col p-4 lg:p-8 relative min-h-screen items-center justify-center">
        <div className="text-center max-w-md bg-white/15 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500 opacity-50" />
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
            Intent Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error || 'Intent not found'}</p>
        </div>
      </div>
    );
  }

  const sources = intent.sources || [];
  const destinations = intent.destinations || [];
  const tokenAddress = sources[0]?.tokenAddress;
  const tokenInfo = getTokenInfo(tokenAddress);
  const statusConfig = getStatusConfig(intent);

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-8 relative min-h-screen">
      <div className="max-w-6xl mx-auto w-full mt-8 lg:mt-12">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => navigate('/explorer')}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl transition-all font-semibold text-sm text-gray-900"
          >
            <ChevronLeft size={16} />
            Back to Explorer
          </button>
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
              Intent #{intent.id}
            </h1>
            <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg inline-flex mx-auto mb-6">
              <span className={statusConfig.color}>
                {statusConfig.icon}
              </span>
              <span className={`text-lg font-semibold ${statusConfig.color}`}>
                {getStatusDisplay(intent)}
              </span>
            </div>
            <p className="text-gray-600 text-base">
              <Clock size={16} className="inline mr-1" /> Expiry: {formatDate(intent.expiry)}
            </p>
          </div>
          <div className="w-32" /> {/* Spacer for alignment */}
        </div>

        {/* From/To Sections */}
        <div className="w-full flex justify-center mb-8">
          <div className="p-4 flex items-center gap-6 w-full relative bg-white/10 backdrop-blur-xl rounded-2xl border border-slate-200/50">
            <FromDisplay
              sources={sources}
              tokenInfo={tokenInfo}
            />
            <ArrowRight className="w-6 h-6 text-slate-400 flex-shrink-0" />
            <ToDisplay
              destinations={destinations}
              tokenInfo={tokenInfo}
            />
          </div>
        </div>

        {/* Summary Table */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Transaction Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Sent</span>
                <span className="font-semibold text-gray-900">{formatBigIntAmount(sources.reduce((sum, src) => sum + (src.value || 0n), 0n), tokenInfo.decimals)} {tokenInfo.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Source Chains</span>
                <span className="font-semibold text-gray-900">{sources.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Primary Source</span>
                <span className="font-semibold text-gray-900">
                  {getNetworkInfo(sources[0]?.chainID)?.name || `Chain ${sources[0]?.chainID}`}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Received</span>
                <span className="font-semibold text-gray-900">{formatBigIntAmount(destinations.reduce((sum, dest) => sum + (dest.value || 0n), 0n), tokenInfo.decimals)} {tokenInfo.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Destination Chains</span>
                <span className="font-semibold text-gray-900">{destinations.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Primary Destination</span>
                <span className="font-semibold text-gray-900">
                  {getNetworkInfo(intent.destinationChainID)?.name || `Chain ${intent.destinationChainID}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Intents };
export default Intents;