// App.js
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Changed to HashRouter
import { DappProvider } from '@multiversx/sdk-dapp/wrappers';
import Explore from './pages/explore';
import NFTMarketplace from './pages/marketplace/nfts';
import ESDTMarketplace from './pages/marketplace/esdt';
import LiveAuctions from './pages/marketplace/auctions';
import CreateCollection from './components/marketplace/CreateCollection';
import CreateESDT from './components/marketplace/CreateESDT';
import { WalletConnector } from './components/WalletConnector';
import MarketplaceNav from './components/marketplace/MarketplaceNav';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router> {/* HashRouter now */}
        <DappProvider
          environment="devnet"
          customNetworkConfig={{ name: 'customConfig', apiTimeout: 10000 }}
          dappConfig={{ shouldUseWebViewProvider: true, logoutRoute: '/' }}
        >
          <div className="app-container">
            <header className="app-header">
              <MarketplaceNav />
              <WalletConnector />
            </header>
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Navigate to="/explore" replace />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/nfts" element={<NFTMarketplace />} />
                <Route path="/esdt" element={<ESDTMarketplace />} />
                <Route path="/auctions" element={<LiveAuctions />} />
                <Route path="/create-nft" element={<CreateCollection />} />
                <Route path="/create-esdt" element={<CreateESDT />} />
              </Routes>
            </main>
          </div>
        </DappProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
