// src/components/MainLayout/Header.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2, ChevronDown } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { useDisconnect } from 'wagmi';
import { useNexus } from '@avail-project/nexus-widgets';
import { tokens } from '../../utils/bridge/bridgeConstants';

interface TokenBalance {
  symbol: string;
  total: number;
  logo: string;
}

export default function Header() {
  const [showBalances, setShowBalances] = useState(false);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { sdk: nexus, isSdkInitialized } = useNexus();

  // Fetch unified balances
  const fetchBalances = useCallback(async () => {
    console.log('Fetching balances:', { nexus, isSdkInitialized, isConnected });
    if (!nexus || !isSdkInitialized || !isConnected) return;
    setLoadingBalances(true);
    try {
      const balanceData: TokenBalance[] = [];
      for (const token of tokens.slice(0, 3)) { // Only ETH, USDT, USDC
        console.log(`Fetching balance for ${token.symbol}`);
        const asset = await nexus.getUnifiedBalance(token.symbol);
        let total = 0;
        if (asset?.breakdown?.length > 0) {
          total = asset.breakdown.reduce((acc, b) => acc + Number(b.balance || 0), 0);
        }
        balanceData.push({ symbol: token.symbol, total, logo: token.logo });
        console.log(`${token.symbol} balance fetched:`, { total, breakdownLength: asset?.breakdown?.length });
      }
      setBalances(balanceData);
      console.log('All balances fetched:', balanceData);
    } catch (err) {
      console.error('Error fetching unified balances:', err);
    } finally {
      setLoadingBalances(false);
    }
  }, [nexus, isSdkInitialized, isConnected]); // Dependencies for useCallback

  // Effect to fetch balances when SDK is ready
  useEffect(() => {
    console.log('Balances useEffect triggered:', { isConnected, isSdkInitialized });
    if (isConnected && isSdkInitialized) {
      fetchBalances();
    }
  }, [isConnected, isSdkInitialized, fetchBalances]);

  const handleConnect = () => {
    console.log('Connect button clicked');
    open({ view: 'Connect' });
  };

  const handleAccount = () => {
    console.log('Account button clicked');
    open({ view: 'Account' });
  };

  const handleDisconnect = () => {
    console.log('Disconnect button clicked');
    disconnect();
  };

  const toggleBalances = () => {
    console.log('Toggle balances clicked, current showBalances:', showBalances);
    setShowBalances(!showBalances);
    if (!showBalances && balances.length === 0) {
      fetchBalances();
    }
  };

  // Wallet is "loading" if it's connected but the SDK isn't ready yet
  const isWalletLoading = isConnected && !isSdkInitialized;

  console.log('Header render:', { isConnected, isSdkInitialized, isWalletLoading, balancesLength: balances.length });

  return (
    <header
      className="fixed top-0 left-0 right-0 h-16 bg-white/15 backdrop-blur-xl border-b border-white/20 flex items-center shadow-lg shadow-slate-200/20 z-50"
    >
      <div className="ml-20 flex-1 flex items-center justify-between px-4 lg:px-8 min-w-0">
        {/* Right: Balances & Wallet Status */}
        <div className="flex items-center gap-4 ml-auto flex-shrink-0 relative">
          {isConnected && (
            <div className="relative">
              <button
                onClick={toggleBalances}
                className="flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white/80 rounded-xl border border-slate-200/50 transition-all duration-300 cursor-pointer group"
                disabled={isWalletLoading} // Disable button if SDK is not ready
              >
                <span className="text-sm font-medium text-slate-900 hidden sm:inline">Unified Portfolio</span>
                <ChevronDown size={16} className="text-slate-400 ml-1 group-hover:rotate-180 transition-transform duration-200" />
              </button>

              {/* Balances Popup */}
              {showBalances && (
                <div className="absolute top-full right-0 mt-2 bg-white/15 backdrop-blur-xl border border-slate-200/50 rounded-xl shadow-lg shadow-slate-200/30 w-64 z-50 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">Unified Balances</h3>
                    <button onClick={() => setShowBalances(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={16} />
                    </button>
                  </div>
                  {loadingBalances ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="animate-spin text-blue-500 mr-2" size={16} />
                      <span className="text-sm text-slate-500">Loading...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {balances.map((bal) => (
                        <div key={bal.symbol} className="flex items-center gap-3 p-3 bg-white/20 rounded-lg">
                          <img 
                            src={bal.logo} 
                            alt={bal.symbol} 
                            className="w-8 h-8 rounded-full" 
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900">{bal.symbol}</div>
                            <div className="text-xs text-slate-500">{bal.total.toFixed(4)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Wallet Button - Shows when connected */}
          {isConnected && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white/80 rounded-xl border border-slate-200/50 transition-all duration-300 group relative">
              {isWalletLoading && (
                <Loader2 className="animate-spin text-blue-500 mr-2" size={16} />
              )}
              <button
                onClick={handleAccount}
                disabled={isWalletLoading}
                className="text-sm font-medium text-slate-900 truncate max-w-32 outline-none"
              >
                {isWalletLoading ? 'Initializing...' : `${address?.slice(0, 6)}...${address?.slice(-4)}`}
              </button>
              <button
                onClick={handleDisconnect}
                disabled={isWalletLoading}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded group-hover:bg-slate-200/50 disabled:opacity-50 ml-2"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
        
        {/* Connect Button - When not connected */}
        {!isConnected && (
          <button
            onClick={handleConnect}
            className="group relative px-6 py-2.5 rounded-xl font-semibold text-sm overflow-hidden transition-all duration-300 disabled:opacity-50 ml-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-gray-500/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative text-white flex items-center gap-2">
              Connect
            </span>
          </button>
        )}
      </div>
    </header>
  );
}