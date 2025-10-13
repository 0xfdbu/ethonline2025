// src/pages/Bridge.tsx

import React, { useState } from 'react';
import { ChevronDown, ArrowRight, Wallet, Link, CurrencyDollar } from 'lucide-react';

const chains = [
  { id: 'ethereum', name: 'Ethereum', icon: 'ETH', color: 'from-blue-500 to-purple-600' },
  { id: 'arbitrum', name: 'Arbitrum', icon: 'ARB', color: 'from-orange-500 to-red-600' },
  { id: 'optimism', name: 'Optimism', icon: 'OP', color: 'from-pink-500 to-rose-600' },
  { id: 'polygon', name: 'Polygon', icon: 'MATIC', color: 'from-indigo-500 to-purple-600' },
];

const tokens = [
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: 'ETH' },
  { id: 'usdc', name: 'USDC', symbol: 'USDC', icon: 'USDC' },
  { id: 'usdt', name: 'USDT', symbol: 'USDT', icon: 'USDT' },
  { id: 'dai', name: 'DAI', symbol: 'DAI', icon: 'DAI' },
];

export function Bridge() {
  const [fromChain, setFromChain] = useState(chains[0]);
  const [toChain, setToChain] = useState(chains[1]);
  const [token, setToken] = useState(tokens[0]);
  const [amount, setAmount] = useState('');
  const [isBridging, setIsBridging] = useState(false);

  const handleBridge = async () => {
    setIsBridging(true);
    // Simulate bridging process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsBridging(false);
    alert('Bridge initiated!'); // Replace with actual bridge logic
  };

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Bridge Assets</h1>
          <p className="text-slate-600">Seamlessly transfer your tokens across chains.</p>
        </div>

        {/* Bridge Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 lg:p-8 space-y-6">
          {/* From Chain */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Wallet size={16} className="text-slate-500" />
              From
            </label>
            <div className="relative">
              <select
                value={fromChain.id}
                onChange={(e) => setFromChain(chains.find(c => c.id === e.target.value))}
                className="w-full p-4 rounded-xl bg-white/50 border border-slate-200/50 hover:border-slate-300/50 transition-colors text-slate-900 font-medium appearance-none bg-no-repeat bg-right pr-10"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")" }}
              >
                {chains.map(chain => (
                  <option key={chain.id} value={chain.id}>{chain.name}</option>
                ))}
              </select>
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-br ${fromChain.color} flex items-center justify-center text-white text-xs font-bold`}>
                {fromChain.icon}
              </div>
            </div>
          </div>

          {/* Arrow Indicator */}
          <div className="flex justify-center">
            <div className="p-3 bg-white/30 rounded-full border border-white/20">
              <ArrowRight size={20} className="text-slate-600" />
            </div>
          </div>

          {/* To Chain */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Link size={16} className="text-slate-500" />
              To
            </label>
            <div className="relative">
              <select
                value={toChain.id}
                onChange={(e) => setToChain(chains.find(c => c.id === e.target.value))}
                className="w-full p-4 rounded-xl bg-white/50 border border-slate-200/50 hover:border-slate-300/50 transition-colors text-slate-900 font-medium appearance-none bg-no-repeat bg-right pr-10"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")" }}
              >
                {chains.map(chain => (
                  <option key={chain.id} value={chain.id}>{chain.name}</option>
                ))}
              </select>
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-br ${toChain.color} flex items-center justify-center text-white text-xs font-bold`}>
                {toChain.icon}
              </div>
            </div>
          </div>

          {/* Token and Amount */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Token Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <CurrencyDollar size={16} className="text-slate-500" />
                Token
              </label>
              <div className="relative">
                <select
                  value={token.id}
                  onChange={(e) => setToken(tokens.find(t => t.id === e.target.value))}
                  className="w-full p-4 rounded-xl bg-white/50 border border-slate-200/50 hover:border-slate-300/50 transition-colors text-slate-900 font-medium appearance-none bg-no-repeat bg-right pr-10"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")" }}
                >
                  {tokens.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-slate-700">
                  {token.icon}
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Amount</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-4 rounded-xl bg-white/50 border border-slate-200/50 hover:border-slate-300/50 transition-colors text-right text-slate-900 font-medium text-lg pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">
                  {token.symbol}
                </span>
              </div>
            </div>
          </div>

          {/* Bridge Button */}
          <button
            onClick={handleBridge}
            disabled={isBridging || !amount}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-200/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isBridging ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Bridging...
              </>
            ) : (
              <>
                Bridge {token.symbol}
                <ArrowRight size={20} />
              </>
            )}
          </button>

          {/* Fees and Info */}
          <div className="text-center text-sm text-slate-600 pt-4 border-t border-slate-200/30">
            Estimated fee: 0.001 ETH • 2-5 minutes
          </div>
        </div>
      </div>
    </div>
  );
}