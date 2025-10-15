// src/pages/Bridge.tsx

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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

// Inline Switch Component
const Switch: React.FC<{ checked: boolean; onChange: () => void; label: string }> = ({ checked, onChange, label }) => (
  <div className="flex items-center justify-between mb-4 p-3 bg-white/15 backdrop-blur-xl rounded-lg">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  </div>
);

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
  <div className="bg-white/15 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-5 space-y-3">
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
  <div className="bg-white/15 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-5 space-y-3">
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
  selectedToken: Token | null;
  onTokenSelect: (token: Token) => void;
  selectedNetworks: Network[];
  onNetworksChange: (networks: Network[]) => void;
  title: string;
  onClose: () => void;
  isSource?: boolean;
  mode?: 'unchained' | 'chained';
  onModeChange?: () => void;
  unifiedBreakdown: Record<string, Record<number, number>>;
  isFetchingBalances: boolean;
  tokens: Token[];
  networks: Network[];
}> = ({
  selectedToken,
  onTokenSelect,
  selectedNetworks,
  onNetworksChange,
  title,
  onClose,
  isSource = false,
  mode = 'unchained',
  onModeChange,
  unifiedBreakdown,
  isFetchingBalances,
  tokens,
  networks,
}) => {
  const isChainedSource = isSource && mode === 'chained';
  const [tempSelected, setTempSelected] = useState<Network[]>(selectedNetworks);

  useEffect(() => {
    setTempSelected(selectedNetworks);
  }, [selectedNetworks]);

  const tempChainIds = tempSelected.map(n => parseInt(n.id));
  const isUnchained = isSource && mode === 'unchained';

  const handleTokenSelect = useCallback((tok: Token) => {
    onTokenSelect(tok);
    onClose();
  }, [onTokenSelect, onClose]);

  const handleNetworkSelectSingle = useCallback((net: Network) => {
    onNetworksChange([net]);
    onClose();
  }, [onNetworksChange, onClose]);

  const handleConfirm = useCallback(() => {
    if (isChainedSource) {
      onNetworksChange(tempSelected);
    }
    onClose();
  }, [isChainedSource, tempSelected, onNetworksChange, onClose]);

  const handleNetworkToggle = useCallback((net: Network) => {
    setTempSelected(prev => 
      prev.some(n => n.id === net.id)
        ? prev.filter(n => n.id !== net.id)
        : [...prev, net]
    );
  }, []);

  const handleModeToggle = useCallback(() => {
    onModeChange?.();
  }, [onModeChange]);

  return (
    <div className="fixed inset-0 bg-white/15 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        </div>

        <div className="flex gap-8">
          {/* Tokens - Left */}
          <div className="w-1/2">
            <h4 className="text-lg font-semibold mb-4 text-slate-900">Tokens</h4>
            <div className="grid grid-cols-2 gap-3">
              {tokens.map(tok => {
                const isSelected = selectedToken?.id === tok.id;
                const sym = tok.symbol;
                const chainBalances = unifiedBreakdown[sym] || {};
                const balanceCids = isUnchained || !isChainedSource ? [] : tempChainIds;
                let sum = 0;
                if (balanceCids.length === 0) {
                  sum = Object.values(chainBalances).reduce((acc: number, bal: number) => acc + bal, 0);
                } else {
                  sum = balanceCids.reduce((acc: number, id: number) => acc + (chainBalances[id] || 0), 0);
                }
                const balanceStr = sum.toFixed(2);
                return (
                  <button
                    key={tok.id}
                    onClick={() => handleTokenSelect(tok)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer relative ${
                      isSelected
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
                      <div className="text-xs text-slate-500">
                        {isFetchingBalances ? 'Loading...' : `Unified: ${balanceStr} ${tok.symbol}`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Networks - Right */}
          <div className="w-1/2">
            <h4 className="text-lg font-semibold mb-4 text-slate-900">
              {isSource ? 'Source Chains' : 'Destination Network'}
            </h4>
            {isSource && onModeChange && (
              <Switch
                checked={mode === 'chained'}
                onChange={handleModeToggle}
                label="Chained Mode (Select specific chains)"
              />
            )}
            {isSource && mode === 'unchained' ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                <div className="text-sm font-medium text-green-700">Unchained Mode</div>
                <div className="text-xs text-green-600 mt-1">All {networks.length} chains selected</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {isSource ? (
                  // Multi-select toggle buttons for source (only in chained)
                  networks.map(net => {
                    const isNetSelected = tempSelected.some(s => s.id === net.id);
                    const chainId = parseInt(net.id);
                    const chainBalance = selectedToken && unifiedBreakdown[selectedToken.symbol]?.[chainId] || 0;
                    const balanceStr = isFetchingBalances ? 'Loading...' : `${chainBalance.toFixed(2)} ${selectedToken?.symbol || ''}`;
                    const buttonClass = `flex items-center justify-between gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer relative w-full ${
                      isNetSelected
                        ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-400/50 shadow-lg shadow-blue-500/20'
                        : 'border-white/20 hover:border-white/40 hover:bg-white/40'
                    }`;
                    return (
                      <button
                        key={net.id}
                        onClick={() => handleNetworkToggle(net)}
                        className={buttonClass}
                      >
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${net.color} flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0`}>
                          <Logo src={net.logo} fallbackText={net.icon} className="w-full h-full" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-slate-900">{net.name}</div>
                          <div className="text-xs text-slate-500">ID: {net.id}</div>
                          <div className="text-xs text-slate-500">{balanceStr || '--'}</div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  // Single select buttons for destination
                  networks.map(net => {
                    const isSelected = selectedNetworks[0]?.id === net.id;
                    return (
                      <button
                        key={net.id}
                        onClick={() => handleNetworkSelectSingle(net)}
                        className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer relative ${
                          isSelected
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
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {isChainedSource && (
          <div className="mt-6 pt-4 border-t border-white/20 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-slate-600 font-medium rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Confirm Selection ({tempSelected.length} chains)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Bridge Component (all rendered stuff here)
export function Bridge() {
  const { sdk: nexus, isSdkInitialized } = useNexus();
  const { isConnected, address } = useAccount();
  const [fromNetworks, setFromNetworks] = useState<Network[]>(() => networks);
  const [fromToken, setFromToken] = useState<Token | null>(() => tokens[0] || null);
  const [toNetwork, setToNetwork] = useState<Network | null>(() => {
    const fromIdx = networks.findIndex(n => n.id === (networks[0]?.id || ''));
    const toIdx = (fromIdx + 1) % networks.length;
    return networks[toIdx] || networks[0] || null;
  });
  const [toToken, setToToken] = useState<Token | null>(() => tokens[0] || null);
  const [mode, setMode] = useState<'unchained' | 'chained'>('unchained');
  const [amount, setAmount] = useState('');
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);
  const [error, setError] = useState('');
  const [unifiedBreakdown, setUnifiedBreakdown] = useState<Record<string, Record<number, number>>>({});
  const [isFetchingBalances, setIsFetchingBalances] = useState(false);

  // Fetch unified breakdowns
  useEffect(() => {
    const fetchUnifiedBalances = async () => {
      if (!nexus || !isSdkInitialized || !isConnected || !address || !tokens.length) {
        return;
      }

      setIsFetchingBalances(true);
      const newBreakdown: Record<string, Record<number, number>> = {};
      try {
        for (const token of tokens) {
          const asset = await nexus.getUnifiedBalance(token.symbol);
          const chainBalances: Record<number, number> = {};
          if (asset?.breakdown && asset.breakdown.length > 0) {
            for (const b of asset.breakdown) {
              const chainId = parseInt(b.chain?.id || '0');
              chainBalances[chainId] = Number(b.balance || 0);
            }
          }
          newBreakdown[token.symbol] = chainBalances;
        }
        setUnifiedBreakdown(newBreakdown);
      } catch (err: any) {
        console.error('Error fetching unified balances:', err);
      } finally {
        setIsFetchingBalances(false);
      }
    };

    fetchUnifiedBalances();
  }, [nexus, isSdkInitialized, isConnected, address, tokens]);

  const { balance: legacyBalance, isFetchingBalance: legacyIsFetching } = useBalance(
    nexus,
    isConnected,
    address,
    isSdkInitialized,
    fromToken,
    fromNetworks[0] || null // Fallback to first for legacy hook
  );

  // Compute total source balance from selected chains (or all if unchained)
  const totalSourceBalance = useMemo(() => {
    if (!fromToken?.symbol || !unifiedBreakdown[fromToken.symbol]) return '0.00';
    const chainBalances = unifiedBreakdown[fromToken.symbol];
    const sourceChainIds = mode === 'unchained' ? [] : fromNetworks.map(n => parseInt(n.id));
    let sum = 0;
    if (sourceChainIds.length === 0) {
      sum = Object.values(chainBalances).reduce((acc: number, bal: number) => acc + bal, 0);
    } else {
      sum = sourceChainIds.reduce((acc: number, id: number) => acc + (chainBalances[id] || 0), 0);
    }
    return sum.toFixed(2);
  }, [fromToken?.symbol, unifiedBreakdown, mode, fromNetworks]);

  const { quote, isFetchingQuote } = useQuote(
    nexus,
    toNetwork,
    fromToken,
    toToken,
    totalSourceBalance, // Pass computed total
    fromNetworks[0], // Pass first for hook compatibility; assume hook handles single
    amount,
    setError
  );

  // Memoize prefill
  const debouncedAmount = useMemo(() => amount, [amount]);
  const sourceChainIds = mode === 'unchained' ? [] : fromNetworks.map(n => parseInt(n.id));
  const prefill = useMemo(() => {
    const base = {
      token: fromToken?.symbol || '',
      amount: debouncedAmount,
      chainId: parseInt(toNetwork?.id || '0'),
    };
    if (sourceChainIds.length > 0) {
      return { ...base, sourceChains: sourceChainIds };
    }
    return base;
  }, [fromToken?.symbol, debouncedAmount, toNetwork?.id, sourceChainIds]);

  const toggleMode = useCallback(() => {
    setMode(prev => {
      const newMode = prev === 'unchained' ? 'chained' : 'unchained';
      if (newMode === 'unchained') {
        setFromNetworks(networks);
      }
      return newMode;
    });
  }, [networks]);

  const handleFromNetworksChange = useCallback((newNets: Network[]) => {
    setFromNetworks(newNets);
  }, []);

  const handleToNetworksChange = useCallback((newNets: Network[]) => {
    setToNetwork(newNets[0] || null);
  }, []);

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

  const fromFirstNetwork = fromNetworks[0] || networks[0] || null;

  if (!isSdkInitialized || !fromToken || !toToken || !toNetwork || !fromNetworks.length) {
    return (
      <div className="flex-1 flex flex-col p-4 lg:p-8 relative min-h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">Initializing...</h2>
          <p className="text-slate-600 mb-6">
            SDK: {isSdkInitialized ? 'Ready' : 'Loading'} | 
            Networks: {toNetwork ? 'Set' : 'Loading'}
          </p>
          <div className="w-8 h-8 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  const isValidAmount = amount && parseFloat(amount) >= 0.001 && fromToken.symbol === toToken.symbol && 
    (mode === 'unchained' || fromNetworks[0]?.id !== toNetwork.id);

  const swapNetworks = () => {
    const oldToNetwork = toNetwork;
    const oldFromFirst = fromNetworks[0] || networks[0] || null;
    setToNetwork(oldFromFirst);
    setFromNetworks(oldToNetwork ? [oldToNetwork] : []);
    setFromToken(toToken);
    setToToken(fromToken);
    setMode('chained');
    // Clear quote and error
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

        <div className="bg-white/15 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-2 relative w-full max-w-[500px]">
          <div className="relative flex flex-col space-y-2">
            <FromSection
              fromNetwork={fromFirstNetwork!}
              fromToken={fromToken!}
              amount={amount}
              onAmountChange={(e) => setAmount(e.target.value)}
              onSelectClick={handleFromSelect}
              isFetchingBalance={isFetchingBalances}
              balance={totalSourceBalance}
              isConnected={isConnected}
            />
            <SwapButton onSwap={swapNetworks} disabled={toNetwork?.id === (mode === 'unchained' ? '' : fromFirstNetwork?.id)} />
            <ToSection
              toNetwork={toNetwork!}
              toToken={toToken!}
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
          selectedToken={fromToken} 
          onTokenSelect={setFromToken} 
          selectedNetworks={fromNetworks}
          onNetworksChange={handleFromNetworksChange}
          title="" 
          onClose={() => setShowFromModal(false)}
          isSource={true}
          mode={mode}
          onModeChange={toggleMode}
          unifiedBreakdown={unifiedBreakdown}
          isFetchingBalances={isFetchingBalances}
          tokens={tokens}
          networks={networks}
        />
      )}
      {showToModal && (
        <NetworkSelector 
          selectedToken={toToken} 
          onTokenSelect={setToToken} 
          selectedNetworks={toNetwork ? [toNetwork] : []}
          onNetworksChange={handleToNetworksChange}
          title="Select Destination Network & Token" 
          onClose={() => setShowToModal(false)}
          isSource={false}
          unifiedBreakdown={unifiedBreakdown}
          isFetchingBalances={isFetchingBalances}
          tokens={tokens}
          networks={networks}
        />
      )}
    </div>
  );
}