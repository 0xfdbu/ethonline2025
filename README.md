# UniVail

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-orange.svg)](https://vitejs.dev/)

UniVail is a modern, intent-driven cross-chain bridging application built on the Avail Nexus SDK. It provides a seamless user interface for bridging assets across multiple blockchains, exploring intents, and managing multichain portfolios. Designed for speed, security, and simplicity, UniVail leverages intent-based execution to handle complex cross-chain operations with minimal friction.

## 🚀 Features

- **Intent-Based Bridging**: Create and execute cross-chain transfers using smart intents powered by Avail Nexus.
- **Unified Portfolio View**: Track balances across chains without switching networks.
- **Intent Explorer**: Monitor, manage, and view details of your bridging intents in real-time.
- **Multi-Chain Support**: Compatible with major EVM chains like Ethereum, Polygon, Arbitrum, and more.
- **Wallet Integration**: Seamless connection via Web3Modal (AppKit) with support for MetaMask, WalletConnect, and others.
- **Responsive Design**: Beautiful, mobile-first UI with Tailwind CSS and Lucide icons.
- **Real-Time Status Updates**: Live tracking of intent fulfillment, refunds, and expirations.

## 🛠 Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite for fast development and bundling
- **Styling**: Tailwind CSS for utility-first design
- **Routing**: React Router DOM
- **State Management**: React hooks + Wagmi for wallet management
- **Blockchain Integration**:
  - Wagmi + AppKit for wallet connections
  - @avail-project/nexus-widgets for Avail Nexus SDK
- **Icons**: Lucide React
- **Charts/Visualization**: React Flow (for potential bridge visualizations)
- **Deployment**: Ready for Vercel, Netlify, or custom hosting

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- Yarn or npm

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/0xfdbu/ethonline2025.git
   cd ethonline2025/frontend  # Note: Navigate to the frontend folder to run the project
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory (inside the frontend folder):
   ```
   VITE_APPKIT_PROJECT_ID=your_appkit_project_id
   VITE_WAGMI_PROJECT_ID=your_wagmi_project_id
   # Add any additional chain-specific RPC URLs if needed
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
# or
yarn build
```

Output will be in the `dist/` folder. Serve it with any static file server.

## 🚀 Usage

### Home Page (`/`)
- Displays a welcoming dashboard with quick actions to launch the bridge or explore intents.
- Connect your wallet to view portfolio insights.

### Bridge Page (`/bridge`)
- Select source tokens and chains for unified balance sourcing.
- Choose destination networks and tokens.
- Simulate and execute bridges with real-time quotes and fees.

### Explorer Page (`/explorer`)
- View all your intents in a card-based grid.
- Filter by status (Pending, Completed, Refunded, Failed).
- Click any intent to view detailed transaction summary.

### Intent Details (`/intents/:id`)
- Deep dive into a specific intent with source/destination breakdowns.
- Transaction summary, expiry, and status visualization.

### Wallet Connection
- Use the header connect button to link your wallet.
- Supports EVM-compatible wallets; auto-initializes Nexus SDK on connection.

## 🔧 Customization

- **Add New Chains/Tokens**: Update `src/utils/bridge/bridgeConstants.ts` with new network and token configs.
- **Styling**: Modify Tailwind config in `tailwind.config.js`.
- **Routing**: Extend routes in `src/App.tsx`.
- **SDK Integration**: Customize Nexus SDK calls in relevant hooks/pages.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

### Code Style
- Use ESLint and Prettier for formatting.
- Run `npm run lint` before committing.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Avail Nexus](https://availproject.org/) for the intent-based bridging SDK.
- [Wagmi](https://wagmi.sh/) and [AppKit](https://reown.com/appkit) for wallet abstractions.
- [Lucide React](https://lucide.dev/) for icons.
- Built with ❤️ for the multichain future.

---

*UniVail: Unifying Value in Avail*