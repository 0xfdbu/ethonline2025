// src/pages/Explorer.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNexus } from '@avail-project/nexus-widgets';
import { useAccount } from 'wagmi';
import { Clock, CheckCircle, XCircle, Clock as Hourglass, AlertCircle, Search, ArrowRight, TrendingUp, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

const IntentCard: React.FC<{ intent: Intent; onClick: () => void; index: number }> = ({ intent, onClick, index }) => {
  const sources = intent.sources || [];
  const destinations = intent.destinations || [];
  const tokenAddress = sources[0]?.tokenAddress;
  const tokenInfo = getTokenInfo(tokenAddress);
  const totalInput = sources.reduce((sum, src) => sum + (src.value || 0n), 0n);
  const totalOutput = destinations.reduce((sum, dest) => sum + (dest.value || 0n), 0n);

  const sourceChainId = sources.length > 0 ? sources[0].chainID : undefined;
  const sourceCount = sources.length;
  const sourceNetwork = getNetworkInfo(sourceChainId);
  const destChainId = intent.destinationChainID;
  const destNetwork = getNetworkInfo(destChainId);
  const statusConfig = getStatusConfig(intent);

  return (
    <div 
      className="group bg-white/15 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-6 cursor-pointer transition-all duration-300 hover:bg-white/25 hover:shadow-xl hover:border-slate-300/70"
      onClick={onClick}
      style={{
        animationDelay: `${index * 50}ms`,
        animation: 'fadeInUp 0.5s ease-out forwards',
        opacity: 0
      }}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusConfig.bg}`}>
            <span className={statusConfig.color}>
              {statusConfig.icon}
            </span>
            <span className={`text-sm font-semibold ${statusConfig.color}`}>
              {getStatusDisplay(intent)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock size={12} />
            <span>{formatDate(intent.expiry)}</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* From */}
          <div className="space-y-2">
            <div className="text-xs text-gray-500 font-medium">From Chain</div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-slate-200/30">
              <div className={`w-7 h-7 rounded-lg ${sourceNetwork ? sourceNetwork.color : 'bg-gradient-to-br from-gray-100 to-gray-200'} flex items-center justify-center shadow-sm overflow-hidden`}>
                {sourceNetwork ? (
                  <img 
                    src={sourceNetwork.logo} 
                    alt={sourceNetwork.name} 
                    className="w-full h-full rounded-lg object-cover" 
                    onError={(e) => { 
                      e.currentTarget.style.display = 'none'; 
                      (e.currentTarget.parentElement as HTMLElement).innerHTML = sourceChainId || '?'; 
                    }} 
                  />
                ) : (
                  <span className="text-xs font-bold text-gray-700">{sourceChainId || '?'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {sourceNetwork ? sourceNetwork.name : `Chain ${sourceChainId || 'N/A'}`}
                </p>
                {sourceCount > 1 && (
                  <span className="text-xs text-gray-500">+{sourceCount - 1} more</span>
                )}
              </div>
            </div>
          </div>

          {/* To */}
          <div className="space-y-2">
            <div className="text-xs text-gray-500 font-medium">To Chain</div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-slate-200/30">
              <div className={`w-7 h-7 rounded-lg ${destNetwork ? destNetwork.color : 'bg-gradient-to-br from-gray-100 to-gray-200'} flex items-center justify-center shadow-sm overflow-hidden`}>
                {destNetwork ? (
                  <img 
                    src={destNetwork.logo} 
                    alt={destNetwork.name} 
                    className="w-full h-full rounded-lg object-cover" 
                    onError={(e) => { 
                      e.currentTarget.style.display = 'none'; 
                      (e.currentTarget.parentElement as HTMLElement).innerHTML = destChainId || '?'; 
                    }} 
                  />
                ) : (
                  <span className="text-xs font-bold text-gray-700">{destChainId || '?'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {destNetwork ? destNetwork.name : `Chain ${destChainId || 'N/A'}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Amount Flow */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-slate-200/30">
          <div className="flex items-center justify-between">
            {/* Send */}
            <div className="flex items-center gap-2.5">
              <img 
                src={tokenInfo.image} 
                alt={tokenInfo.symbol} 
                className="w-9 h-9 rounded-full ring-2 ring-white/50 shadow-sm" 
              />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Sending</p>
                <p className="font-bold text-gray-900 text-base">
                  {formatBigIntAmount(totalInput, tokenInfo.decimals)} {tokenInfo.symbol}
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex-1 flex items-center justify-center mx-3">
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>

            {/* Receive */}
            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-0.5">Receiving</p>
                <p className="font-bold text-gray-900 text-base">
                  {formatBigIntAmount(totalOutput, tokenInfo.decimals)} {tokenInfo.symbol}
                </p>
              </div>
              <img 
                src={tokenInfo.image} 
                alt={tokenInfo.symbol} 
                className="w-9 h-9 rounded-full ring-2 ring-white/50 shadow-sm" 
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
            <span>Intent #{intent.id || 'N/A'}</span>
          </div>
          <div className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors flex items-center gap-1 font-medium">
            View Details
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
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
        <div className="text-center max-w-md bg-white/15 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
            Initializing Explorer
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            SDK: <span className={isSdkInitialized ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>{isSdkInitialized ? 'Ready' : 'Loading'}</span>
            {' • '}
            Wallet: <span className={isConnected ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </p>
          <div className="w-10 h-10 border-3 border-gray-300 border-t-gray-700 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-8 relative min-h-screen">
      <div className="max-w-6xl mx-auto w-full mt-8 lg:mt-12">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-xl rounded-full border border-slate-200/50 text-sm text-gray-700 font-medium mb-4">
            <Zap className="w-4 h-4 text-gray-600" />
            Powered by Avail Nexus
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 tracking-tight">
            Your Intents
            <span className="text-gray-600"> Explorer</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Track, manage, and monitor your cross-chain bridging intents in real-time. Fast, secure, and transparent.
          </p>
        </div>
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-3 border-gray-300 border-t-gray-700 rounded-full animate-spin mb-4" />
            <span className="text-gray-600">Fetching intents...</span>
          </div>
        )}
        
        {error && (
          <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-center mb-6">
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            <p className="mb-3 font-medium">{error}</p>
            <button
              onClick={fetchIntents}
              className="px-5 py-2 bg-white hover:bg-red-50 border border-red-300 rounded-xl transition-colors font-semibold text-sm"
            >
              Retry
            </button>
          </div>
        )}
        
        {!loading && intents.length === 0 && !error && (
          <div className="text-center py-16 bg-white/15 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-10">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Intents Found</h3>
            <p className="text-gray-600">Create your first intent to get started</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {intents.map((intent, index) => (
            <IntentCard key={intent.id} intent={intent} onClick={() => handleIntentClick(intent)} index={index} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export function Explorer() {
  return <ExplorerList />;
}