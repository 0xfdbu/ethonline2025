// src/components/MainLayout/Header.tsx

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { open } = useAppKit();

  // Sample JSON data for search (tokens and addresses)
  const searchData = [
    { id: 1, type: 'Token', name: 'Ethereum', symbol: 'ETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', value: 'ETH' },
    { id: 2, type: 'Token', name: 'Bitcoin', symbol: 'BTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', value: 'BTC' },
    { id: 3, type: 'Token', name: 'USDC', symbol: 'USDC', address: '0xA0b86a33E6417D8dbB9a3fC5b3d2B2f6b5C8e7f4', value: 'USDC' },
    { id: 4, type: 'Address', name: 'Vitalik Wallet', address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', value: 'Vitalik' },
    { id: 5, type: 'Address', name: 'ChainHub Fund', address: '0x742d35Cc6634C0532925a3b8D7a5D2C4b1b0cE4e', value: 'Fund' },
  ];

  const filteredData = searchData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const limitedData = filteredData.slice(0, 2);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowDropdown(true);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    setShowDropdown(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    // Delay hiding dropdown to allow clicking on results
    setTimeout(() => setShowDropdown(false), 200);
  };

  const handleConnect = () => {
    open({ view: 'Connect' });
  };

  const getItemLink = (item) => {
    const baseUrl = 'https://etherscan.io';
    return item.type === 'Token' 
      ? `${baseUrl}/token/${item.address}` 
      : `${baseUrl}/address/${item.address}`;
  };

  return (
    <header className="h-16 bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-3xl border-b border-white/20 flex items-center shadow-lg shadow-slate-200/20 sticky top-0 z-40 relative">
      <div className="ml-20 flex-1 flex items-center justify-between px-4 lg:px-8 min-w-0">
        {/* Left: Search Bar */}
        <div className="flex-1 max-w-md relative min-w-0">
          <div
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 border border-slate-200/50 ${
              isSearchFocused
                ? 'bg-white/80 shadow-lg shadow-blue-500/20 border-blue-300/30'
                : 'bg-white/40 hover:bg-white/50'
            }`}
          >
            <Search
              size={18}
              className={`flex-shrink-0 transition-colors ${
                isSearchFocused ? 'text-blue-500' : 'text-slate-400'
              }`}
            />
            <input
              type="text"
              placeholder="Search addresses, tokens..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-500 outline-none font-medium min-w-0"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Dropdown Results */}
          {showDropdown && limitedData.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white/90 backdrop-blur-md border border-slate-200/30 rounded-xl shadow-lg shadow-slate-200/30 max-h-60 overflow-y-auto z-50">
              {limitedData.map((item) => (
                <a
                  key={item.id}
                  href={getItemLink(item)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 hover:bg-slate-50/50 cursor-pointer border-b border-white/10 last:border-b-0 transition-colors no-underline"
                  onClick={() => setShowDropdown(false)}
                >
                  <div className="text-sm font-medium text-slate-900">{item.name}</div>
                  <div className="text-xs text-slate-500 flex gap-2">
                    <span>{item.type}</span>
                    <span>{item.symbol || item.address.slice(0, 6) + '...'}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Right: Connect Wallet Button */}
        <div className="flex items-center gap-4 ml-auto flex-shrink-0">
          <button
            onClick={handleConnect}
            className="group relative px-6 py-2.5 rounded-xl font-semibold text-sm overflow-hidden transition-all duration-300"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-gray-500/40" />
            
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Content */}
            <span className="relative text-white">
              Connect
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}