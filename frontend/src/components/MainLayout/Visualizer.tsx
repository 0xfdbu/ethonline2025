// src/MainLayout/Visualizer.tsx

import React, { useCallback } from 'react';
import { ArrowRight, DollarSign, Zap, Shield, TrendingUp } from 'lucide-react';

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

interface Source {
  amount: string;
  chainID: number;
  chainLogo: string;
  chainName: string;
  contractAddress: string;
}

interface Quote {
  input: string;
  output: string;
  gasFee: string;
  bridgeFee: string;
  slippage: string;
  allSources?: Source[];
}

interface Fees {
  caGas: string;
  gasSupplied: string;
  protocol: string;
  solver: string;
  total: string;
}

interface VisualizerProps {
  quote: Quote;
  fromToken: Token;
  selectedSources: number[];
  onSourcesToggle: (chainId: number) => void;
  toNetwork: Network;
  toToken: Token;
  fees: Fees;
}

// Helper function to format amounts to max 6 decimals
const formatAmount = (amountStr: string): string => {
  const num = parseFloat(amountStr || '0');
  return num.toFixed(6);
};

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

export const Visualizer: React.FC<VisualizerProps> = ({
  quote,
  fromToken,
  selectedSources,
  onSourcesToggle,
  toNetwork,
  toToken,
  fees
}) => {
  const handleToggle = useCallback((chainId: number) => {
    onSourcesToggle(chainId);
  }, [onSourcesToggle]);

  const FlowArrow: React.FC = () => (
    <div className="flex items-center justify-center py-2">
      <div className="flex flex-col items-center">
        <ArrowRight size={20} className="text-slate-400" />
        <div className="w-0.5 h-4 bg-slate-300" />
      </div>
    </div>
  );

  const FeeItem: React.FC<{ icon: React.ReactNode; label: string; amount: string; color: string }> = ({ icon, label, amount, color }) => (
    <div className={`flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-${color}-50 to-${color}-100 border border-${color}-200`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg bg-${color}-100 flex items-center justify-center`}>{icon}</div>
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <span className="text-sm font-bold text-slate-900">{formatAmount(amount)}</span>
    </div>
  );

  return (
    <div className="bg-white/15 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-5 space-y-4 max-h-[80vh] overflow-y-auto">
      {/* Title */}
      <h4 className="text-lg font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
        <TrendingUp size={20} className="text-blue-500" />
        Bridge Preview
      </h4>

      {/* Sources Breakdown */}
      <div className="space-y-2">
        <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
          <Shield size={12} className="text-slate-400" />
          Toggle chains to customize (none = auto-select)
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {quote.allSources?.map((source: Source, i: number) => {
            const chainId = source.chainID;
            const isSelected = selectedSources.includes(chainId);
            return (
              <button
                key={i}
                onClick={() => handleToggle(chainId)}
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer relative w-full ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-400/50 shadow-lg shadow-blue-500/20'
                    : 'bg-white/20 border border-white/20 hover:border-white/40'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <img 
                    src={source.chainLogo} 
                    alt={source.chainName} 
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <span className="font-medium text-slate-900 text-sm truncate">{source.chainName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold text-slate-900 whitespace-nowrap`}>
                    {formatAmount(source.amount)} {fromToken.symbol}
                  </span>
                  <div className={`w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-blue-500 border-blue-500' : 'bg-transparent'
                  }`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
              </button>
            );
          }) || <p className="text-sm text-slate-500 italic">No sources available</p>}
        </div>
        <div className="pt-2 border-t border-white/20 flex justify-between font-semibold bg-gradient-to-r from-slate-100/50 to-slate-200/50 rounded-lg p-3">
          <span className="text-sm text-slate-700">Total Send</span>
          <span className="text-sm text-slate-900">{formatAmount(quote.input)} {fromToken.symbol}</span>
        </div>
      </div>

      {/* Flow Visualization */}
      <div className="space-y-4">
        <FlowArrow />
        
        {/* Fees Breakdown */}
        <div className="space-y-2">
          <h5 className="text-sm font-semibold text-slate-600 flex items-center gap-2">
            <DollarSign size={16} className="text-green-500" />
            Fees Breakdown
          </h5>
          <div className="space-y-1">
            <FeeItem icon={<Zap size={16} />} label="Protocol Fee" amount={fees.protocol} color="green" />
            <FeeItem icon={<Shield size={16} />} label="Solver Fee" amount={fees.solver} color="blue" />
            <FeeItem icon={<TrendingUp size={16} />} label="CA Gas" amount={fees.caGas} color="purple" />
            <div className="pt-2 border-t border-slate-200/50 flex justify-between font-bold text-lg">
              <span className="text-slate-700">Total Fees</span>
              <span className="text-green-600">{formatAmount(fees.total)} {fromToken.symbol}</span>
            </div>
          </div>
        </div>

        <FlowArrow />

        {/* Destination */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-4 border border-green-200/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              <ArrowRight size={16} className="text-green-500" />
              Destination
            </span>
            <img 
              src={toNetwork.logo} 
              alt={toNetwork.name} 
              className="w-6 h-6 rounded-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg overflow-hidden">
                <Logo src={toToken.logo} fallbackText={toToken.icon} className="w-full h-full" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">{toToken.symbol}</div>
                <div className="text-xs text-slate-500">{toNetwork.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{formatAmount(quote.output)}</div>
              <div className="text-xs text-slate-500">Est. Receive</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};