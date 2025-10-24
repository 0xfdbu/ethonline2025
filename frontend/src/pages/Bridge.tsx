// src/pages/Bridge.tsx

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ChevronDown, X, Play } from 'lucide-react';
import { useNexus } from '@avail-project/nexus-widgets';
import { BridgeButton } from '@avail-project/nexus-widgets';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { networks, tokens } from '../utils/bridge/bridgeConstants';
import { useQuote } from '../utils/bridge/bridgeHooks';
import { Visualizer } from '../components/bridge/Visualizer';

// ... (Interfaces: Network, Token, Quote - unchanged) ...
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
  input: string;
  output: string;
  gasFee: string;
  bridgeFee: string;
  slippage: string;
  allSources?: any[];
  detailedFees?: {
    caGas: string;
    gasSupplied: string;
    protocol: string;
    solver: string;
    total: string;
  };
}

const parseChainId = (idStr: any): number => {
  const str = String(idStr || '0');
  if (str.startsWith('0x')) return parseInt(str, 16);
  return parseInt(str, 10);
};

const formatAmount = (amountStr: string): string => parseFloat(amountStr || '0').toFixed(6);

// ... (Logo Component - unchanged) ...
const Logo: React.FC<{ src: string; fallbackText: string; className: string }> = ({ src, fallbackText, className }) => (
  <div className={className}>
    {src ? (
      <img src={src} alt={fallbackText} className="w-full h-full rounded-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
    ) : (
      <span className="text-xs font-bold text-white">{fallbackText}</span>
    )}
  </div>
);

const FromSection: React.FC<{
  fromToken: Token;
  estimatedSend: string;
  onSelectClick: () => void;
  isFetchingBalance: boolean;
  balance: string;
  isConnected: boolean;
  quote: Quote | null;
  isFetchingQuote: boolean;
  effectiveMode: 'unchained' | 'chained';
  selectedSourcesCount: number;
}> = ({
  fromToken,
  estimatedSend,
  onSelectClick,
  isFetchingBalance,
  balance,
  isConnected,
  quote,
  isFetchingQuote,
  // ... other props
}) => (
  <div className="flex-1 bg-white/15 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-4 space-y-3 w-full min-w-0">
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">You Send</span>
      <span className="text-xs text-slate-500 font-medium truncate">
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
      <div className="text-2xl sm:text-3xl font-bold text-slate-900 rounded-lg text-left flex-1 min-w-0 truncate">
        {isFetchingQuote ? <div className="text-slate-400">--</div> : quote ? formatAmount(quote.input) : '0.00'}
      </div>
      <button
        onClick={onSelectClick}
        className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-white/60 hover:bg-white/90 border border-slate-200/50 rounded-xl transition-all cursor-pointer"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg overflow-hidden">
          <Logo src={fromToken.logo} fallbackText={fromToken.icon} className="w-full h-full" />
        </div>
        <span className="font-semibold text-slate-900 text-sm">{fromToken.symbol}</span>
        <ChevronDown size={14} className="text-slate-500" />
      </button>
    </div>
  </div>
);

const ToSection: React.FC<{
  toNetwork: Network;
  toToken: Token;
  amount: string;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  quote: Quote | null;
  isFetchingQuote: boolean;
  onSelectClick: () => void;
}> = ({
  toNetwork,
  toToken,
  amount,
  onAmountChange,
  quote,
  isFetchingQuote,
  onSelectClick,
}) => (
  <div className="flex-1 bg-white/15 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-4 space-y-3 w-full min-w-0">
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">You Receive</span>
      <span className="text-xs text-slate-500 font-medium">
        {isFetchingQuote ? 'Loading...' : quote ? `Gas: ${formatAmount(quote.gasFee)}` : 'Gas: --'}
      </span>
    </div>
    <div className="flex justify-between items-center gap-3">
      <input
        type="number"
        placeholder="0.00"
        value={amount}
        onChange={onAmountChange}
        className="flex-1 min-w-0 bg-transparent text-2xl sm:text-3xl font-bold text-slate-900 placeholder-slate-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        onClick={onSelectClick}
        className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-white/60 hover:bg-white/90 border border-slate-200/50 rounded-xl transition-all cursor-pointer"
      >
        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${toNetwork.color} flex items-center justify-center shadow-lg overflow-hidden`}>
          <Logo src={toNetwork.logo} fallbackText={toNetwork.icon} className="w-full h-full" />
        </div>
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg overflow-hidden">
          <Logo src={toToken.logo} fallbackText={toToken.icon} className="w-full h-full" />
        </div>
        <span className="font-semibold text-slate-900 text-sm">{toToken.symbol}</span>
        <ChevronDown size={14} className="text-slate-500" />
      </button>
    </div>
  </div>
);

// ... (TokenButton Component - unchanged) ...
const TokenButton: React.FC<{ token: Token; isSelected: boolean; onSelect: (token: Token) => void; unifiedBalance: string; isFetchingBalances: boolean }> = ({
  token,
  isSelected,
  onSelect,
  unifiedBalance,
  isFetchingBalances,
}) => (
  <button
    onClick={() => onSelect(token)}
    className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer relative ${
      isSelected
        ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-400/50 shadow-lg shadow-blue-500/20'
        : 'border-white/20 hover:border-white/40 hover:bg-white/40'
    }`}
  >
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg overflow-hidden">
      <Logo src={token.logo} fallbackText={token.icon} className="w-full h-full" />
    </div>
    <div className="flex-1 text-left">
      <div className="font-semibold text-slate-900">{token.name}</div>
      <div className="text-xs text-slate-500">{token.symbol}</div>
      <div className="text-xs text-slate-500">
        {isFetchingBalances ? 'Loading...' : `Unified: ${unifiedBalance} ${token.symbol}`}
      </div>
    </div>
  </button>
);

// ... (NetworkButton Component - unchanged) ...
const NetworkButton: React.FC<{ network: Network; isSelected: boolean; onSelect: (network: Network) => void }> = ({
  network,
  isSelected,
  onSelect,
}) => (
  <button
    onClick={() => onSelect(network)}
    className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer relative ${
      isSelected
        ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-400/50 shadow-lg shadow-blue-500/20'
        : 'border-white/20 hover:border-white/40 hover:bg-white/40'
    }`}
  >
    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${network.color} flex items-center justify-center shadow-lg overflow-hidden`}>
      <Logo src={network.logo} fallbackText={network.icon} className="w-full h-full" />
    </div>
    <div className="flex-1 text-left">
      <div className="font-semibold text-slate-900">{network.name}</div>
      <div className="text-xs text-slate-500">ID: {network.id}</div>
    </div>
  </button>
);

const NetworkSelector: React.FC<{
  selectedToken: Token | null;
  onTokenSelect: (token: Token) => void;
  selectedNetworks: Network[];
  onNetworksChange: (networks: Network[]) => void;
  title: string;
  onClose: () => void;
  isSource?: boolean;
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
  unifiedBreakdown,
  isFetchingBalances,
  tokens,
  networks,
}) => {
  // ... (hooks and handlers - unchanged) ...
  const [tempSelected, setTempSelected] = useState<Network[]>(selectedNetworks);

  useEffect(() => setTempSelected(selectedNetworks), [selectedNetworks]);

  const handleTokenSelect = useCallback((tok: Token) => { onTokenSelect(tok); onClose(); }, [onTokenSelect, onClose]);

  const handleNetworkSelectSingle = useCallback((net: Network) => { onNetworksChange([net]); onClose(); }, [onNetworksChange, onClose]);

  const handleConfirm = useCallback(() => { onNetworksChange(tempSelected); onClose(); }, [tempSelected, onNetworksChange, onClose]);

  const handleNetworkToggle = useCallback((net: Network) => {
    setTempSelected(prev => prev.some(n => n.id === net.id) ? prev.filter(n => n.id !== net.id) : [...prev, net]);
  }, []);

  const getUnifiedBalance = useCallback((sym: string) => {
    const chainBalances = unifiedBreakdown[sym] || {};
    const sum = Object.values(chainBalances).reduce((acc: number, bal: number) => acc + bal, 0);
    return sum.toFixed(2);
  }, [unifiedBreakdown]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-2xl rounded-3xl p-4 md:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
        </div>
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {isSource ? (
            <div className="w-full">
              <h4 className="text-lg font-semibold mb-4 text-slate-900">Tokens</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tokens.map(tok => (
                  <TokenButton
                    key={tok.id}
                    token={tok}
                    isSelected={selectedToken?.id === tok.id}
                    onSelect={handleTokenSelect}
                    unifiedBalance={getUnifiedBalance(tok.symbol)}
                    isFetchingBalances={isFetchingBalances}
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="w-full md:w-1/2">
                <h4 className="text-lg font-semibold mb-4 text-slate-900">Tokens</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tokens.map(tok => (
                    <TokenButton
                      key={tok.id}
                      token={tok}
                      isSelected={selectedToken?.id === tok.id}
                      onSelect={handleTokenSelect}
                      unifiedBalance={getUnifiedBalance(tok.symbol)}
                      isFetchingBalances={isFetchingBalances}
                    />
                  ))}
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <h4 className="text-lg font-semibold mb-4 text-slate-900">Destination Network</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {networks.map(net => (
                    <NetworkButton
                      key={net.id}
                      network={net}
                      isSelected={selectedNetworks[0]?.id === net.id}
                      onSelect={handleNetworkSelectSingle}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export function Bridge() {
  // ... (all hooks and state variables - unchanged) ...
  const { sdk: nexus, isSdkInitialized } = useNexus();
  const { isConnected, address } = useAccount();
  const currentChainId = useChainId();
  const { switchChain, error: switchError, isPending: switchPending } = useSwitchChain();
  const [fromToken, setFromToken] = useState<Token | null>(() => tokens[0] || null);
  const [toNetwork, setToNetwork] = useState<Network | null>(() => {
    const fromIdx = networks.findIndex(n => n.id === (networks[0]?.id || ''));
    return networks[(fromIdx + 1) % networks.length] || networks[0] || null;
  });
  const [toToken, setToToken] = useState<Token | null>(() => tokens[0] || null);
  const [amount, setAmount] = useState('');
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);
  const [error, setError] = useState('');
  const [unifiedBreakdown, setUnifiedBreakdown] = useState<Record<string, Record<number, number>>>({});
  const [isFetchingBalances, setIsFetchingBalances] = useState(false);
  const [balancesLoaded, setBalancesLoaded] = useState(false);
  const [selectedSources, setSelectedSources] = useState<number[]>([]);
  const [detailedFees, setDetailedFees] = useState({ caGas: '0', gasSupplied: '0', protocol: '0', solver: '0', total: '0' });

  // ... (all memos, effects, and handlers - unchanged) ...
  const totalSourceBalance = useMemo(() => {
    if (!fromToken?.symbol || !unifiedBreakdown[fromToken.symbol]) return '0.00';
    const chainBalances = unifiedBreakdown[fromToken.symbol];
    const sourceChainIds = selectedSources.length > 0 ? selectedSources : Object.keys(chainBalances).map(parseChainId);
    const sum = sourceChainIds.reduce((acc: number, id: number) => acc + (chainBalances[id] || 0), 0);
    return sum.toFixed(2);
  }, [fromToken?.symbol, unifiedBreakdown, selectedSources]);

  const sourceChainIds = useMemo(() => selectedSources.length > 0 ? selectedSources : [], [selectedSources]);

  const effectiveMode = useMemo(() => selectedSources.length > 0 ? 'chained' : 'unchained' as const, [selectedSources.length]);

  const { quote, isFetchingQuote, fetchQuote } = useQuote(nexus, toNetwork, fromToken, toToken, totalSourceBalance, sourceChainIds, amount, setError);

  const handleSwitchChain = useCallback(async () => {
    if (!toNetwork?.id) return;
    const chainIdNum = parseChainId(toNetwork.id);
    try {
      await switchChain({ chainId: chainIdNum });
      setError('');
      await fetchQuote(amount);
    } catch (err: any) {
      if (err.code === 4902 || err.message.includes('Unrecognized')) {
        setError('Chain not added to wallet. Please add it manually via your wallet settings.');
      } else {
        setError(`Failed to switch chain: ${err.message}`);
      }
    }
  }, [toNetwork?.id, switchChain, fetchQuote, amount]);

  const handleSimulate = useCallback(async () => {
    console.log('Simulate button clicked, calling fetchQuote with amount:', amount);
    await fetchQuote(amount);
  }, [fetchQuote, amount]);

  useEffect(() => {
    if (quote?.detailedFees) setDetailedFees(quote.detailedFees);
  }, [quote]);

  useEffect(() => {
    if (switchError) {
      setError(`Switch chain error: ${switchError.message}`);
    }
  }, [switchError]);

  const prefill = useMemo(() => {
    const chainIdNum = parseChainId(toNetwork?.id || '1');
    const base = { token: fromToken?.symbol || '', amount, chainId: chainIdNum };
    return sourceChainIds.length > 0 ? { ...base, sourceChains: sourceChainIds } : base;
  }, [fromToken?.symbol, amount, toNetwork?.id, sourceChainIds]);

  const handleFromTokenSelect = useCallback((tok: Token) => {
    setFromToken(tok);
    if (toToken?.id !== tok.id) setToToken(tok);
  }, [toToken]);

  const handleToTokenSelect = useCallback((tok: Token) => {
    setToToken(tok);
    if (fromToken?.id !== tok.id) setFromToken(tok);
  }, [fromToken]);

  const handleToNetworksChange = useCallback((newNets: Network[]) => setToNetwork(newNets[0] || null), []);

  const handleSourcesToggle = useCallback((chainIdStr: string) => {
    const chainId = parseChainId(chainIdStr);
    setSelectedSources(prev => prev.includes(chainId) ? prev.filter(id => id !== chainId) : [...prev, chainId].sort((a, b) => a - b));
  }, []);

  useEffect(() => {
    const fetchUnifiedBalances = async () => {
      if (!nexus || !isSdkInitialized || !isConnected || !address || !tokens.length) return;
      setIsFetchingBalances(true);
      const newBreakdown: Record<string, Record<number, number>> = {};
      try {
        for (const token of tokens) {
          const asset = await nexus.getUnifiedBalance(token.symbol);
          const chainBalances: Record<number, number> = {};
          if (asset?.breakdown?.length > 0) {
            asset.breakdown.forEach(b => {
              const chainId = parseChainId(b.chain?.id || '0');
              chainBalances[chainId] = Number(b.balance || 0);
            });
          }
          newBreakdown[token.symbol] = chainBalances;
        }
        setUnifiedBreakdown(newBreakdown);
      } catch (err) {
        console.error('Error fetching unified balances:', err);
      } finally {
        setIsFetchingBalances(false);
        setBalancesLoaded(true);
      }
    };
    fetchUnifiedBalances();
  }, [nexus, isSdkInitialized, isConnected, address]); // Removed 'tokens' as it's a constant import

  // Default simulation on page load after initialization and balances loaded
  useEffect(() => {
    if (isSdkInitialized && fromToken && toToken && toNetwork && amount === '' && balancesLoaded) {
      setAmount('0.01');
      fetchQuote('0.01');
    }
  }, [isSdkInitialized, fromToken, toToken, toNetwork, amount, balancesLoaded, fetchQuote]);


  if (!networks.length || !tokens.length) {
    // ... (no network message - unchanged) ...
  }

  if (!isSdkInitialized || !fromToken || !toToken || !toNetwork) {
    return (
      <div className="flex-1 flex flex-col p-4 lg:p-8 relative min-h-screen items-center justify-center">
        <div className="text-center w-full max-w-md bg-white/15 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-4 sm:p-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
            Initializing Bridging
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

  const isValidAmount = amount && parseFloat(amount) >= 0.001 && fromToken.symbol === toToken.symbol && quote && parseFloat(quote.input || '0') <= parseFloat(totalSourceBalance);

  const handleFromSelect = () => setShowFromModal(true);
  const handleToSelect = () => setShowToModal(true);

  const placeholderQuote: Quote = {
    input: '0',
    output: amount || '0',
    gasFee: '0',
    bridgeFee: '0',
    slippage: '0',
    allSources: [],
    detailedFees: detailedFees,
  };

  const isUnrecognizedChainError = error.includes('Unrecognized chain ID');

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-8 relative min-h-screen items-center justify-start mt-5 lg:mt-10">
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">
        <div className="w-full flex justify-center">
          {/* This is the key responsive change: flex-col on mobile, md:flex-row on desktop */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full relative">
            <FromSection
              fromToken={fromToken}
              estimatedSend={quote?.input || '0'}
              onSelectClick={handleFromSelect}
              isFetchingBalance={isFetchingBalances}
              balance={totalSourceBalance}
              isConnected={isConnected}
              quote={quote}
              isFetchingQuote={isFetchingQuote}
              effectiveMode={effectiveMode}
              selectedSourcesCount={selectedSources.length}
            />
            <ToSection
              toNetwork={toNetwork}
              toToken={toToken}
              amount={amount}
              onAmountChange={(e) => setAmount(e.target.value)}
              quote={quote}
              isFetchingQuote={isFetchingQuote}
              onSelectClick={handleToSelect}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 w-full">
            {error}
            {isUnrecognizedChainError && (
              <button
                onClick={handleSwitchChain}
                disabled={switchPending}
                className="mt-2 flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm disabled:opacity-50"
              >
                {switchPending ? 'Switching...' : 'Switch to Destination Chain'}
              </button>
            )}
          </div>
        )}

        {/* Responsive button container: stacks on mobile, row on desktop */}
        <div className="w-full flex flex-col-reverse sm:flex-row sm:justify-end gap-4">
          <button
            onClick={handleSimulate}
            disabled={isFetchingQuote}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
              isFetchingQuote
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 hover:shadow-xl transform hover:scale-105'
            }`}
          >
            <Play size={16} />
            {isFetchingQuote ? 'Simulating...' : 'Simulate'}
          </button>
          <BridgeButton prefill={prefill}>
            {({ onClick, isLoading }) => {
              const handleBridgeClick = useCallback(() => {
                console.log('Data sent to widget to execute bridge:', prefill);
                onClick();
              }, [onClick, prefill]);
              return (
                <button
                  onClick={handleBridgeClick}
                  disabled={isLoading || !isValidAmount || !nexus || !isConnected || isFetchingQuote}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                    isLoading || !isValidAmount || !nexus || !isConnected || isFetchingQuote
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Bridging...
                    </>
                  ) : !isValidAmount || !isConnected ? (
                    isConnected ? 'Enter Amount' : 'Connect Wallet'
                  ) : (
                    'Bridge Now'
                  )}
                </button>
              );
            }}
          </BridgeButton>
        </div>

        {/* Added overflow-x-auto as a safeguard for the Visualizer on small screens */}
        <div className="w-full overflow-x-auto">
          <Visualizer
            quote={quote || placeholderQuote}
            fromToken={fromToken}
            selectedSources={selectedSources}
            onSourcesToggle={handleSourcesToggle}
            toNetwork={toNetwork}
            toToken={toToken}
            fees={detailedFees}
          />
        </div>
      </div>

      {showFromModal && (
        <NetworkSelector
          selectedToken={fromToken}
          onTokenSelect={handleFromTokenSelect}
          selectedNetworks={[]}
          onNetworksChange={() => {}}
          title="Select Source Token"
          onClose={() => setShowFromModal(false)}
          isSource={true}
          unifiedBreakdown={unifiedBreakdown}
          isFetchingBalances={isFetchingBalances}
          tokens={tokens}
          networks={networks}
        />
      )}
      {showToModal && (
        <NetworkSelector
          selectedToken={toToken}
          onTokenSelect={handleToTokenSelect}
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