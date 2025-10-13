// Bridge.tsx

import React, { useState } from 'react';
import { ArrowDown, Wallet, ChevronDown, X, Zap } from 'lucide-react';
import { SUPPORTED_CHAINS, TOKEN_METADATA, CHAIN_METADATA } from '@avail-project/nexus-widgets'; // Removed SUPPORTED_TOKENS (it's a type, not a value)

const networkColors = {
  '1': 'from-blue-500 to-cyan-500',      // Ethereum
  '10': 'from-red-500 to-red-600',       // Optimism
  '137': 'from-purple-500 to-indigo-600', // Polygon
  '42161': 'from-orange-400 to-orange-600', // Arbitrum
  '43114': 'from-red-400 to-pink-500',   // Avalanche
  '8453': 'from-blue-600 to-blue-700',   // Base
  '534352': 'from-green-500 to-emerald-600', // Scroll
  '50104': 'from-indigo-500 to-violet-600', // Sophon
  '8217': 'from-yellow-500 to-amber-600', // Kaia
  '56': 'from-yellow-400 to-orange-500',  // BNB
  '999': 'from-pink-500 to-rose-600',     // HyperEVM
  // Add more as per SUPPORTED_CHAINS updates
};
const networks = Object.entries(SUPPORTED_CHAINS).map(([chainIdStr, chain]) => {
  // Try to find metadata by name or shortName since SUPPORTED_CHAINS uses names as keys
  const metadata = Object.values(CHAIN_METADATA).find(
    (m: any) =>
      m.name?.toLowerCase() === chainIdStr.toLowerCase() ||
      m.shortName?.toLowerCase() === chainIdStr.toLowerCase() ||
      m.nativeCurrency?.symbol?.toLowerCase() === chainIdStr.toLowerCase()
  );


  return {
    id: chainIdStr,
    name: metadata?.name || chain.name || chainIdStr,
    icon: metadata?.nativeCurrency?.symbol || chain.nativeCurrency?.symbol || chainIdStr,
    color: networkColors[chainIdStr] || 'from-gray-500 to-gray-600',
    logo:
      metadata?.logo ||
      (chainIdStr === 'ETHEREUM'
        ? 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
        : ''), // fallback for Ethereum
  };
});



// Hardcode supported tokens based on package docs (ETH, USDC, USDT)
const supportedTokens = ['ETH', 'USDC', 'USDT'];

// Map token symbols to CoinGecko logo URLs
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
  logo: tokenLogos[tokenSymbol] || '', // Add logo URL
}));

// Helper component for rendering logos (without overlay text)
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
    ) : null}
  </div>
);

export function Bridge() {
  const [fromNetwork, setFromNetwork] = useState(networks[0]);
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toNetwork, setToNetwork] = useState(networks[1]);
  const [toToken, setToToken] = useState(tokens[0]);
  const [amount, setAmount] = useState('');
  const [isBridging, setIsBridging] = useState(false);
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);

  const handleBridge = async () => {
    setIsBridging(true);
    // TODO: Integrate actual bridging via Nexus SDK, e.g., useNexus().bridge({ fromChainId: fromNetwork.id, toChainId: toNetwork.id, token: fromToken.symbol, amount })
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsBridging(false);
  };

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
          <button onClick={() => isFrom ? setShowFromModal(false) : setShowToModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-white/50 rounded-lg cursor-pointer">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="grid grid-cols-2 gap-3">
              {networks.map(net => (
                <button
                  key={net.id}
                  onClick={() => {
                    onNetworkSelect(net);
                  }}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer relative ${
                    selectedNetwork.id === net.id
                      ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-400/50 shadow-lg shadow-blue-500/20'
                      : 'border-white/20 hover:border-white/40 hover:bg-white/40'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${net.color} flex items-center justify-center shadow-lg relative overflow-hidden`}>
                    <Logo src={net.logo} fallbackText={net.icon} className="w-full h-full" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-slate-900">{net.name}</div>
                    <div className="text-xs text-slate-500">Layer 2 Network</div>
                  </div>
                  {selectedNetwork.id === net.id && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-white/0 via-white/30 to-white/0" />

          <div>
            <div className="grid grid-cols-2 gap-3">
              {tokens.map(tok => (
                <button
                  key={tok.id}
                  onClick={() => {
                    onTokenSelect(tok);
                    isFrom ? setShowFromModal(false) : setShowToModal(false);
                  }}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer relative ${
                    selectedToken.id === tok.id
                      ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-400/50 shadow-lg shadow-blue-500/20'
                      : 'border-white/20 hover:border-white/40 hover:bg-white/40'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg relative overflow-hidden">
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

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-8 relative min-h-screen flex items-center justify-center">
      <div className="max-w-3xl mx-auto w-full flex flex-col items-center">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold">Swap anytime<br></br>anywhere</h1>
        </div>

        {/* Main Bridge Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-2 relative w-full max-w-[500px]">
          {/* Wrapping both boxes and swap button */}
          <div className="relative flex flex-col space-y-2">
            {/* From Box */}
            <div className="bg-slate-50/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-5 space-y-3 hover:border-slate-300/70 transition-all relative z-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">You Send</span>
                <span className="text-xs text-slate-500 font-medium">Balance: 0.00</span> {/* TODO: Use useNexus().getUnifiedBalances() for real balance */}
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 bg-transparent text-4xl font-bold text-slate-900 placeholder-slate-400 outline-none w-32 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => setShowFromModal(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-white/60 hover:bg-white/90 border border-slate-200/50 rounded-xl transition-all group whitespace-nowrap cursor-pointer relative"
                >
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${fromNetwork.color} flex items-center justify-center shadow-lg relative overflow-hidden`}>
                    <Logo src={fromNetwork.logo} fallbackText={fromNetwork.icon} className="w-full h-full text-xs" />
                  </div>
                  <span className="font-semibold text-slate-900">{fromToken.symbol}</span>
                  <ChevronDown size={16} className="text-slate-500" />
                </button>
              </div>
            </div>

            {/* Perfectly Centered Swap Button */}
            <button
              onClick={swapNetworks}
              aria-label="Swap networks"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl border border-white/20 shadow-lg shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-600/40 transition-all backdrop-blur-sm z-10 cursor-pointer"
            >
              <ArrowDown size={24} className="text-white group-hover:scale-110 transition-transform" />
            </button>

            {/* To Box */}
            <div className="bg-slate-50/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-5 space-y-3 hover:border-slate-300/70 transition-all relative z-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">You Receive</span>
                <span className="text-xs text-slate-500 font-medium">Gas: ~0.001 ETH</span> {/* TODO: Estimate gas via SDK */}
              </div>
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <div className="text-4xl font-bold text-slate-900">
                    {amount ? (parseFloat(amount) * 0.99).toFixed(4) : '0.00'} {/* TODO: Use SDK quote for accurate receive amount */}
                  </div>
                </div>
                <button
                  onClick={() => setShowToModal(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-white/60 hover:bg-white/90 border border-slate-200/50 rounded-xl transition-all group whitespace-nowrap cursor-pointer relative"
                >
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${toNetwork.color} flex items-center justify-center shadow-lg relative overflow-hidden`}>
                    <Logo src={toNetwork.logo} fallbackText={toNetwork.icon} className="w-full h-full text-xs" />
                  </div>
                  <span className="font-semibold text-slate-900">{toToken.symbol}</span>
                  <ChevronDown size={16} className="text-slate-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Bridge Button */}
          <button
            onClick={handleBridge}
            disabled={isBridging || !amount}
            className="w-full py-4 px-6 mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-300 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-600/50 disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isBridging ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Bridging...
              </>
            ) : (
              <>Bridge Now</>
            )}
          </button>
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