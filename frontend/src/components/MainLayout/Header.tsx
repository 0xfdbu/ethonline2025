// src/components/MainLayout/Header.tsx

import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { useDisconnect } from 'wagmi';
import { useNexus } from '@avail-project/nexus-widgets';

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false); // For UX loading
  const { open } = useAppKit();
  const { address, isConnected, connector, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { initializeSdk, deinitializeSdk, isSdkInitialized } = useNexus();
  const isInitializingRef = useRef(false);

  // Initialize Nexus SDK on wallet connect/account/chain change, deinit on disconnect
  useEffect(() => {
    const init = async () => {
      if (!isConnected || !connector?.getProvider || isSdkInitialized || isInitializingRef.current) {
        return;
      }

      isInitializingRef.current = true;
      setIsInitializing(true);
      try {
        const provider = await connector.getProvider();
        await initializeSdk(provider);
      } catch (err) {
        console.error('Nexus SDK initialization failed:', err);
      } finally {
        isInitializingRef.current = false;
        setIsInitializing(false);
      }
    };

    if (isConnected) {
      init();
    } else if (!isConnected && isSdkInitialized) {
      deinitializeSdk();
    }
  }, [isConnected, connector, address, chainId, isSdkInitialized]);

  const handleConnect = () => {
    open({ view: 'Connect' });
  };

  const handleAccount = () => {
    open({ view: 'Account' });
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const isWalletLoading = isConnected && isInitializing;

  return (
    <header
      className="fixed top-0 left-0 right-0 h-16 bg-white/15 backdrop-blur-xl border-b border-white/20 flex items-center shadow-lg shadow-slate-200/20 z-50"
    >
      <div className="ml-20 flex-1 flex items-center justify-between px-4 lg:px-8 min-w-0">
        {/* Right: Wallet Status */}
        <div className="flex items-center gap-4 ml-auto flex-shrink-0">
          {isConnected ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white/80 rounded-xl border border-slate-200/50 transition-all duration-300 cursor-pointer group relative">
              {isWalletLoading && (
                <Loader2 className="animate-spin text-blue-500 mr-2" size={16} />
              )}
              <button
                onClick={handleAccount}
                disabled={isWalletLoading}
                className="text-sm font-medium text-slate-900 truncate max-w-32 outline-none"
              >
                {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
              </button>
              <button
                onClick={handleDisconnect}
                disabled={isWalletLoading}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded group-hover:bg-slate-200/50 disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isWalletLoading}
              className="group relative px-6 py-2.5 rounded-xl font-semibold text-sm overflow-hidden transition-all duration-300 disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-gray-500/40" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative text-white flex items-center gap-2">
                {isWalletLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}