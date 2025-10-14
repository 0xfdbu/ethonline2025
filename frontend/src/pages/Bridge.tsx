// src/pages/Bridge.tsx

import React, { useState, useMemo } from 'react';
import { ChevronDown, X, ArrowDown } from 'lucide-react';
import { useNexus } from '@avail-project/nexus-widgets';
import { BridgeButton } from '@avail-project/nexus-widgets';
import { useAccount } from 'wagmi';
import { networks, tokens } from '../utils/bridge/bridgeConstants';
import { useBalance, useQuote } from '../utils/bridge/bridgeHooks';

// Types (embedded for simplicity; move to types/ if needed)
interface Network {
  id: string;
  name: string;
  icon: string;
  color: string;
  logo: string;
}

interface Token {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  decimals: number;
  logo: string;
}

interface Quote {
  output: string;
  gasFee: string;
  bridgeFee: string;
  slippage: string;
}

// Inline Logo Component
const Logo: React.FC<{ src: string; fallbackText: string; className: string }> = ({ src, fallbackText, className }) => (
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

// Inline SwapButton Component
const SwapButton: React.FC<{ onSwap: () => void; disabled: boolean }> = ({ onSwap, disabled }) => (
  <button
    onClick={onSwap}
    disabled={disabled}
    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-3 rounded-xl border shadow-lg z-10 cursor-pointer transition-all ${
      disabled
        ? 'bg-gray-400 border-gray-400'
        : 'bg-black hover:bg-gray-800 border border-gray-800'
    }`}
  >
    <ArrowDown size={24} className="text-white" />
  </button>
);

// Inline FromSection Component
const FromSection: React.FC<{
  fromNetwork: Network;
  fromToken: Token;
  amount: string;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectClick: () => void;
  isFetchingBalance: boolean;
  balance: string;
  isConnected: boolean;
}> = ({
  fromNetwork,
  fromToken,
  amount,
  onAmountChange,
  onSelectClick,
  isFetchingBalance,
  balance,
  isConnected,
}) => (
  <div className="bg-slate-50/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-5 space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">You Send</span>
      <span className="text-xs text-slate-500 font-medium">
        {isFetchingBalance ? (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
            Loading...
          </div>
        ) : isConnected ? (
          `Balance: ${balance} ${fromToken.symbol}`
        ) : (
          'Connect wallet to view balance'
        )}
      </span>
    </div>
    <div className="flex justify-between items-center gap-3">
      <input
        type="number"
        placeholder="0.00"
        value={amount}
        onChange={onAmountChange}
        className="max-w-[200px] bg-transparent text-4xl font-bold text-slate-900 placeholder-slate-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        onClick={onSelectClick}
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
);

// Inline ToSection Component
const ToSection: React.FC<{
  toNetwork: Network;
  toToken: Token;
  amount: string;
  quote: Quote | null;
  isFetchingQuote: boolean;
  onSelectClick: () => void;
}> = ({
  toNetwork,
  toToken,
  amount,
  quote,
  isFetchingQuote,
  onSelectClick,
}) => (
  <div className="bg-slate-50/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-5 space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">You Receive</span>
      <span className="text-xs text-slate-500 font-medium">
        {isFetchingQuote ? 'Loading...' : quote ? `Gas: ${quote.gasFee}` : 'Gas: --'}
      </span>
    </div>
    <div className="flex gap-3 items-center">
      <div className="flex-1">
        <div className="text-4xl font-bold text-slate-900">
          {isFetchingQuote ? (
            <div className="text-slate-400">--</div>
          ) : quote ? (
            `${quote.output} ${toToken.symbol}`
          ) : (
            amount ? `${amount} ${toToken.symbol}` : '0.00'
          )}
        </div>
        {quote && !isFetchingQuote && (
          <div className="text-xs text-slate-500 mt-1">
            Fee: {quote.bridgeFee} {toNetwork.icon} • Slippage: {quote.slippage}%
          </div>
        )}
      </div>
      <button
        onClick={onSelectClick}
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
);

// Inline NetworkSelector Component
const NetworkSelector: React.FC<{
  selectedNetwork: Network | null;
  selectedToken: Token | null;
  onNetworkSelect: (network: Network) => void;
  onTokenSelect: (token: Token) => void;
  title: string;
  onClose: () => void;
}> = ({
  selectedNetwork,
  selectedToken,
  onNetworkSelect,
  onTokenSelect,
  title,
  onClose,
}) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
    <div className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-2xl rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <button 
          onClick={onClose} 
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
                onClick={() => {
                  onNetworkSelect(net);
                  onClose();
                }}
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
                  onClose();
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

// Main Bridge Component (all rendered stuff here)
export function Bridge() {
  const { sdk: nexus, isSdkInitialized } = useNexus();
  const { isConnected, address } = useAccount();
  const [fromNetwork, setFromNetwork] = useState<Network | null>(() => networks[0] || null);
  const [fromToken, setFromToken] = useState<Token | null>(() => tokens[0] || null);
  const [toNetwork, setToNetwork] = useState<Network | null>(() => {
    const fromIdx = networks.findIndex(n => n.id === (networks[0]?.id || ''));
    const toIdx = (fromIdx + 1) % networks.length;
    return networks[toIdx] || networks[0] || null;
  });
  const [toToken, setToToken] = useState<Token | null>(() => tokens[0] || null);
  const [amount, setAmount] = useState('');
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);
  const [error, setError] = useState('');

  const { balance, isFetchingBalance } = useBalance(nexus, isConnected, address, isSdkInitialized, fromToken, fromNetwork);
  const { quote, isFetchingQuote } = useQuote(nexus, toNetwork, fromToken, toToken, balance, fromNetwork, amount, setError);

  // Memoize prefill to prevent unnecessary re-renders of BridgeButton during typing/debounced quote updates
  // Only update prefill when amount stabilizes (e.g., on blur or manual trigger), but for now, debounce it separately
  const debouncedAmount = useMemo(() => amount, [amount]); // Simple memo; for true debounce, use a separate state with delay
  const prefill = useMemo(() => ({
    token: fromToken?.symbol || '',
    amount: debouncedAmount,
    chainId: parseInt(toNetwork?.id || '0'),
  }), [fromToken?.symbol, debouncedAmount, toNetwork?.id]);

  if (!networks.length || !tokens.length) {
    return (
      <div className="flex-1 flex flex-col p-4 lg:p-8 relative min-h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">No Networks Available</h2>
          <p className="text-slate-600 mb-6">
            Supported networks: {networks.length}, Tokens: {tokens.length}
          </p>
        </div>
      </div>
    );
  }

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

  const isValidAmount = amount && parseFloat(amount) >= 0.001 && fromToken.symbol === toToken.symbol && fromNetwork.id !== toNetwork.id;

  const swapNetworks = () => {
    setFromNetwork(toNetwork);
    setToNetwork(fromNetwork);
    setFromToken(toToken);
    setToToken(fromToken);
    setQuote(null);
    setError('');
  };

  const handleFromSelect = () => setShowFromModal(true);
  const handleToSelect = () => setShowToModal(true);

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-8 relative min-h-screen items-center justify-center">
      <div className="max-w-3xl mx-auto w-full flex flex-col items-center">
        <div className="mb-12 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-slate-900">Swap anytime<br />anywhere</h1>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-2 relative w-full max-w-[500px]">
          <div className="relative flex flex-col space-y-2">
            <FromSection
              fromNetwork={fromNetwork}
              fromToken={fromToken}
              amount={amount}
              onAmountChange={(e) => setAmount(e.target.value)}
              onSelectClick={handleFromSelect}
              isFetchingBalance={isFetchingBalance}
              balance={balance}
              isConnected={isConnected}
            />
            <SwapButton onSwap={swapNetworks} disabled={fromNetwork.id === toNetwork.id} />
            <ToSection
              toNetwork={toNetwork}
              toToken={toToken}
              amount={amount}
              quote={quote}
              isFetchingQuote={isFetchingQuote}
              onSelectClick={handleToSelect}
            />
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Use memoized prefill to avoid re-renders on every keystroke */}
          <BridgeButton prefill={prefill}>
            {({ onClick, isLoading }) => (
              <button
                onClick={onClick}
                disabled={isLoading || !isValidAmount || !nexus || !isConnected}
                className="w-full py-4 px-6 mt-4 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-xl font-bold text-lg shadow-xl disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border border-gray-800"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Bridging...
                  </>
                ) : !isValidAmount || !isConnected ? (
                  isConnected ? 'Enter Amount' : 'Connect Wallet'
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
          onClose={() => setShowFromModal(false)}
        />
      )}
      {showToModal && (
        <NetworkSelector 
          selectedNetwork={toNetwork} 
          selectedToken={toToken} 
          onNetworkSelect={setToNetwork} 
          onTokenSelect={setToToken} 
          title="Select Destination Network & Token" 
          onClose={() => setShowToModal(false)}
        />
      )}
    </div>
  );
}