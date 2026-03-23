// App.js
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DappProvider } from '@multiversx/sdk-dapp/wrappers';
import { useGetLoginInfo } from '@multiversx/sdk-dapp/hooks';
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

// Auth checker component
const AuthChecker = () => {
  const { isLoggedIn } = useGetLoginInfo();
  
  useEffect(() => {
    // Check if we have manual address stored from custom login
    const storedAddress = localStorage.getItem('wallet_address');
    if (storedAddress && !isLoggedIn) {
      console.log('Found stored address:', storedAddress);
      // The SDK should pick this up, if not we can force a reload
      if (!window.location.search.includes('address=')) {
        // Only reload if not already processing a callback
      }
    }
  }, [isLoggedIn]);
  
  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <DappProvider
          environment="devnet"
          customNetworkConfig={{
            name: 'customConfig',
            apiTimeout: 10000
          }}
          dappConfig={{
            shouldUseWebViewProvider: true,
            logoutRoute: '/',
          }}
        >
          <AuthChecker />
          <div className="app-container">
            <header className="app-header">
              <MarketplaceNav />
              <WalletConnector />
            </header>
            <main className="main-content" style={{ minHeight: '500px', background: '#1a1a2e' }}>
              <Routes>
                <Route path="/" element={<Navigate to="/explore" replace />} />
                <Route path="/marketplace/explore" element={<Explore />} />
                <Route path="/marketplace/nfts" element={<NFTMarketplace />} />
                <Route path="/marketplace/esdt" element={<ESDTMarketplace />} />
                <Route path="/marketplace/auctions" element={<LiveAuctions />} />
                <Route path="/marketplace/create-nft" element={<CreateCollection />} />
                <Route path="/marketplace/create-esdt" element={<CreateESDT />} />
              </Routes>
            </main>
          </div>
        </DappProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
