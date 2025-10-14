// src/utils/bridge/bridgeConstants.ts

import { SUPPORTED_CHAINS, TOKEN_METADATA, CHAIN_METADATA } from '@avail-project/nexus-widgets';

export const networkColors = {
  // Testnets only
  '11155111': 'from-blue-500 to-cyan-500', // Sepolia
  '11155420': 'from-red-500 to-red-600', // Optimism Sepolia
  '80002': 'from-purple-500 to-indigo-600', // Polygon Amoy
  '421614': 'from-orange-400 to-orange-600', // Arbitrum Sepolia
  '84532': 'from-blue-600 to-blue-700', // Base Sepolia
  '10143': 'from-slate-500 to-slate-600', // Monad Testnet
};

const testnetIds = ['11155111', '11155420', '80002', '421614', '84532', '10143'];

export const networks = Object.entries(SUPPORTED_CHAINS)
  .map(([chainIdStr, chain]) => {
    const metadata = CHAIN_METADATA[chain];
    return {
      id: chain.toString(),
      name: metadata?.name || chainIdStr,
      icon: metadata?.nativeCurrency?.symbol || chainIdStr,
      color: networkColors[chain.toString()] || 'from-gray-500 to-gray-600',
      logo: metadata?.logoURI || metadata?.logo || '',
    };
  })
  .filter(net => testnetIds.includes(net.id));

export const supportedTokens = ['ETH', 'USDC', 'USDT'];

export const tokenLogos = {
  'ETH': 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  'USDC': 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
  'USDT': 'https://assets.coingecko.com/coins/images/325/small/Tether-logo.png',
};

export const tokens = supportedTokens.map((tokenSymbol) => ({
  id: tokenSymbol.toLowerCase(),
  name: TOKEN_METADATA[tokenSymbol]?.name || tokenSymbol,
  symbol: tokenSymbol,
  icon: tokenSymbol,
  decimals: TOKEN_METADATA[tokenSymbol]?.decimals || 18,
  logo: tokenLogos[tokenSymbol] || '',
}));