// src/pages/Bridge.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowDown, ChevronDown, X } from 'lucide-react';
import { useNexus } from '@avail-project/nexus-widgets';
import { BridgeButton } from '@avail-project/nexus-widgets';
import { SUPPORTED_CHAINS, TOKEN_METADATA, CHAIN_METADATA } from '@avail-project/nexus-widgets';

const networkColors = {
  '11155111': 'from-blue-500 to-cyan-500', // Sepolia
  '11155420': 'from-red-500 to-red-600', // Optimism Sepolia
  '80002': 'from-purple-500 to-indigo-600', // Polygon Amoy
  '421614': 'from-orange-400 to-orange-600', // Arbitrum Sepolia
  '84532': 'from-blue-600 to-blue-700', // Base Sepolia
  '10143': 'from-slate-500 to-slate-600', // Monad Testnet
};

const networks = Object.entries(SUPPORTED_CHAINS).map(([chainIdStr, chain]) => {
  const metadata = CHAIN_METADATA[chain];
  console.log('Chain metadata for', chainIdStr, metadata);
  return {
    id: chain.toString(),
    name: metadata?.name || chainIdStr,
    icon: metadata?.nativeCurrency?.symbol || chainIdStr,
    color: networkColors[chain.toString()] || 'from-gray-500 to-gray-600',
    logo: metadata?.logoURI || metadata?.logo || '',
  };
}).filter(net => networkColors[net.id]); // Filter to testnet

console.log('Final networks array:', networks);

const supportedTokens = ['ETH', 'USDC', 'USDT'];

const tokenLogos = {
  'ETH': 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  'USDC': 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
  'USDT': 'https://assets.coingecko.com/coins/images/325/small/Tether-logo.png',
};

const tokens = supportedTokens.map((tokenSymbol) => ({
  id: tokenSymbol.toLowerCase(),
  name: TOKEN_METADATA[tokenSymbol]?.name || tokenSymbol,
  symbol: tokenSymbol,
  icon: tokenSymbol,
  decimals: TOKEN_METADATA[tokenSymbol]?.decimals || 18,
  logo: tokenLogos[tokenSymbol] || '',
}));

console.log('Tokens array:', tokens);

const Logo = ({ src, fallbackText, className }) => (
  <div className={className}>
    {src ? (
      <img
        src={src}
        alt={fallbackText}
        className="w-full h-full rounded-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    ) : (
      <span className="text-xs font-bold text-white">{fallbackText}</span>
    )}
  </div>
);

export function Bridge() {
  const { sdk: nexus, isSdkInitialized } = useNexus();
  const [fromNetwork, setFromNetwork] = useState(() => networks[0] || null);
  const [fromToken, setFromToken] = useState(() => tokens[0] || null);
  const [toNetwork, setToNetwork] = useState(() => networks[1] || networks[0] || null);
  const [toToken, setToToken] = useState(() => tokens[0] || null);
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState('0.00');
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [isBridging, setIsBridging] = useState(false);
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);
  const [error, setError] = useState('');

  console.log('Bridge render - networks length:', networks.length, 'tokens length:', tokens.length);

  if (!networks.length || !tokens.length) {
    return (
      <div className="flex-1 flex flex-col p-4 lg:p-8 relative min-h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">No Networks Available</h2>
          <p className="text-slate-600 mb-6">
            Supported networks: {networks.length}, Tokens: {tokens.length}
          </p>
          <pre className="text-xs bg-gray-100 p-2 rounded">
            {JSON.stringify({ networks: networks.slice(0, 2), tokens: tokens.slice(0, 2) }, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  // Fetch balance for from chain and token
  useEffect(() => {
    const fetchBalance = async () => {
      if (!nexus || !fromToken?.symbol || !fromNetwork?.id) {
        setBalance('0.00');
        return;
      }

      setIsFetchingBalance(true);
      try {
        const fromChainId = parseInt(fromNetwork.id);
        const asset = await nexus.getUnifiedBalance(fromToken.symbol);
        if (asset?.breakdown && asset.breakdown.length > 0) {
          const chainBal = asset.breakdown.find((b) => b?.chain?.id === fromChainId);
          if (chainBal) {
            const balNum = Number(chainBal.balance) / 10 ** fromToken.decimals;
            setBalance(isNaN(balNum) ? '0.00' : balNum.toFixed(2));
            return;
          }
        }
        setBalance('0.00');
      } catch (err) {
        console.error('Balance fetch error:', err);
        setBalance('0.00');
      } finally {
        setIsFetchingBalance(false);
      }
    };

    fetchBalance();
  }, [nexus, fromToken, fromNetwork]);

  const swapNetworks = () => {
    setFromNetwork(toNetwork);
    setToNetwork(fromNetwork);
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const NetworkSelector = ({ selectedNetwork, selectedToken, onNetworkSelect, onTokenSelect, title, isFrom }) => (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-2xl rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button 
            onClick={() => (isFrom ? setShowFromModal(false) : setShowToModal(false))} 
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-white/50 rounded-lg cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Networks */}
          <div>
            <div className="grid grid-cols-2 gap-3">
              {networks.map(net => (
                <button
                  key={net.id}
                  onClick={() => onNetworkSelect(net)}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer relative ${
                    selectedNetwork?.id === net.id
                      ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-400/50 shadow-lg shadow-blue-500/20'
                      : 'border-white/20 hover:border-white/40 hover:bg-white/40'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${net.color} flex items-center justify-center shadow-lg overflow-hidden`}>
                    <Logo src={net.logo} fallbackText={net.icon} className="w-full h-full" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-slate-900">{net.name}</div>
                    <div className="text-xs text-slate-500">ID: {net.id}</div>
                  </div>
                  {selectedNetwork?.id === net.id && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-white/0 via-white/30 to-white/0" />

          {/* Tokens */}
          <div>
            <div className="grid grid-cols-2 gap-3">
              {tokens.map(tok => (
                <button
                  key={tok.id}
                  onClick={() => {
                    onTokenSelect(tok);
                    if (isFrom) setShowFromModal(false);
                    else setShowToModal(false);
                  }}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer relative ${
                    selectedToken?.id === tok.id
                      ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-400/50 shadow-lg shadow-blue-500/20'
                      : 'border-white/20 hover:border-white/40 hover:bg-white/40'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg overflow-hidden">
                    <Logo src={tok.logo} fallbackText={tok.icon} className="w-full h-full" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-slate-900">{tok.name}</div>
                    <div className="text-xs text-slate-500">{tok.symbol}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isSdkInitialized || !fromNetwork || !toNetwork || !fromToken || !toToken) {
    return (
      <div className="flex-1 flex flex-col p-4 lg:p-8 relative min-h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">Initializing...</h2>
          <p className="text-slate-600 mb-6">
            SDK: {isSdkInitialized ? 'Ready' : 'Loading'} | 
            Networks: {fromNetwork ? 'Set' : 'Loading'}
          </p>
          <div className="w-8 h-8 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  const isValidAmount = amount && parseFloat(amount) >= 0.001 && fromToken.symbol === toToken.symbol;

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-8 relative min-h-screen items-center justify-center">
      <div className="max-w-3xl mx-auto w-full flex flex-col items-center">
        <div className="mb-12 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-slate-900">Swap anytime<br />anywhere</h1>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-2 relative w-full max-w-[500px]">
          <div className="relative flex flex-col space-y-2">
            {/* From Box */}
            <div className="bg-slate-50/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">You Send</span>
                <span className="text-xs text-slate-500 font-medium">
                  {isFetchingBalance ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    `Balance: ${balance} ${fromToken.symbol}`
                  )}
                </span>
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 bg-transparent text-4xl font-bold text-slate-900 placeholder-slate-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => setShowFromModal(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-white/60 hover:bg-white/90 border border-slate-200/50 rounded-xl transition-all whitespace-nowrap cursor-pointer"
                >
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${fromNetwork.color} flex items-center justify-center shadow-lg overflow-hidden`}>
                    <Logo src={fromNetwork.logo} fallbackText={fromNetwork.icon} className="w-full h-full" />
                  </div>
                  <span className="font-semibold text-slate-900">{fromToken.symbol}</span>
                  <ChevronDown size={16} className="text-slate-500" />
                </button>
              </div>
            </div>

            {/* Swap Button */}
            <button
              onClick={swapNetworks}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl border border-white/20 shadow-lg z-10 cursor-pointer"
            >
              <ArrowDown size={24} className="text-white" />
            </button>

            {/* To Box */}
            <div className="bg-slate-50/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">You Receive</span>
                <span className="text-xs text-slate-500 font-medium">
                  Gas: Included
                </span>
              </div>
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <div className="text-4xl font-bold text-slate-900">
                    {amount ? `${amount} ${toToken.symbol}` : '0.00'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Fee: ~0.001 {fromNetwork.icon} • Slippage: 0%
                  </div>
                </div>
                <button
                  onClick={() => setShowToModal(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-white/60 hover:bg-white/90 border border-slate-200/50 rounded-xl transition-all whitespace-nowrap cursor-pointer"
                >
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${toNetwork.color} flex items-center justify-center shadow-lg overflow-hidden`}>
                    <Logo src={toNetwork.logo} fallbackText={toNetwork.icon} className="w-full h-full" />
                  </div>
                  <span className="font-semibold text-slate-900">{toToken.symbol}</span>
                  <ChevronDown size={16} className="text-slate-500" />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <BridgeButton
            prefill={{
              token: fromToken.symbol,
              amount: amount,
              chainId: parseInt(toNetwork.id),
            }}
          >
            {({ onClick, isLoading }) => (
              <button
                onClick={onClick}
                disabled={isLoading || !isValidAmount || !nexus}
                className="w-full py-4 px-6 mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-300 text-white rounded-xl font-bold text-lg shadow-xl disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Bridging...
                  </>
                ) : !isValidAmount ? (
                  'Enter Amount'
                ) : (
                  'Bridge Now'
                )}
              </button>
            )}
          </BridgeButton>
        </div>
      </div>

      {showFromModal && (
        <NetworkSelector 
          selectedNetwork={fromNetwork} 
          selectedToken={fromToken} 
          onNetworkSelect={setFromNetwork} 
          onTokenSelect={setFromToken} 
          title="Select Source Network & Token" 
          isFrom={true} 
        />
      )}
      {showToModal && (
        <NetworkSelector 
          selectedNetwork={toNetwork} 
          selectedToken={toToken} 
          onNetworkSelect={setToNetwork} 
          onTokenSelect={setToToken} 
          title="Select Destination Network & Token" 
          isFrom={false} 
        />
      )}
    </div>
  );
}