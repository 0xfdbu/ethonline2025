import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { createAppKit } from '@reown/appkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mainnet, sepolia } from 'wagmi/chains';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

// Create Reown AppKit
const projectId = '23908c335a70d4fbe35271c97eb55029'; // Get from https://reown.com/appkit
const metadata = {
  name: 'Intent Composer',
  description: 'Build and simulate cross-chain intents',
  url: 'https://yourapp.com',
  icons: ['https://yourapp.com/icon.png'],
};

const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, sepolia],
  projectId,
});

const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, sepolia],
  projectId,
  metadata,
  features: {
    analytics: false, // Set to false to avoid issues
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);