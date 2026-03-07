import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RealSdkProvider } from './components/stubs/SdkStubs';
import { WalletConnector } from './components/WalletConnector';
import MarketplaceNav from './components/marketplace/MarketplaceNav';
import Explore from './pages/explore';
import NFTMarketplace from './pages/marketplace/nfts';
import ESDTMarketplace from './pages/marketplace/esdt';
import TestConnection from './components/TestConnection';
import { AnalyticsDashboard } from './components/Analytics/AnalyticsDashboard';
import LiveAuctions from './pages/marketplace/auctions';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <RealSdkProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="app-container">
            <header className="app-header">
              <MarketplaceNav />
              <WalletConnector />
            </header>

            <main className="main-content">
              <Routes>
                <Route path="/" element={<Navigate to="/explore" replace />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/marketplace/nfts" element={<NFTMarketplace />} />
                <Route path="/marketplace/esdt" element={<ESDTMarketplace />} />
                <Route path="/marketplace/auctions" element={<LiveAuctions />} />
                <Route path="/test" element={<TestConnection />} />
                <Route path="/analytics" element={<AnalyticsDashboard />} />
                <Route path="*" element={
                  <div style={{ textAlign: 'center', padding: '4rem', color: '#fff' }}>
                    <h1>404 - Page Not Found</h1>
                  </div>
                } />
              </Routes>
            </main>

            <footer className="app-footer">
              <p>Trad3E Marketplace © 2026 | Devnet Mode</p>
            </footer>
          </div>
        </Router>
      </QueryClientProvider>
    </RealSdkProvider>
  );
}

export default App;
