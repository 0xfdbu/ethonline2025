import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mainnet, sepolia, baseSepolia, arbitrumSepolia, optimismSepolia, polygonAmoy } from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId from https://dashboard.reown.com
const projectId = '23908c335a70d4fbe35271c97eb55029';

// 2. Create a metadata object - optional
const metadata = {
  name: 'Intent Composer',
  description: 'Build and simulate cross-chain intents',
  url: 'https://yourapp.com',
  icons: ['https://yourapp.com/icon.png'],
};

// 3. Set the networks
const networks = [mainnet, sepolia, baseSepolia, arbitrumSepolia, optimismSepolia, polygonAmoy];

// 4. Create Wagmi Adapter (added defaultChain for testnet focus)
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
  defaultChain: sepolia, // Helps with initial chain; change to mainnet if needed
});

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: false,
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </WagmiProvider>
    </BrowserRouter>
  </React.StrictMode>,
);