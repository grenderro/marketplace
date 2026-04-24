// App.js
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Changed to HashRouter
import { DappProvider } from '@multiversx/sdk-dapp/wrappers';
import { ACTIVE_NETWORK } from './config';
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
          environment={ACTIVE_NETWORK.id}
          customNetworkConfig={{
            id: 'devnet',
            chainId: 'D',
            name: 'Devnet',
            egldLabel: 'xEGLD',
            decimals: '18',
            digits: '4',
            gasPerDataByte: '1500',
            apiTimeout: '10000',
            walletConnectDeepLink: 'https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://xportal.com/',
            walletAddress: 'https://devnet-wallet.multiversx.com',
            // xAliasAddress is not part of CustomNetworkType, provided by SDK defaults
            apiAddress: 'https://devnet-api.multiversx.com',
            explorerAddress: 'https://devnet-explorer.multiversx.com',
            skipFetchFromServer: true,
            ...(process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID &&
              process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID !== 'your_walletconnect_project_id_here' &&
              process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID !== 'your_new_id'
              ? { walletConnectV2ProjectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID }
              : {}),
          }}
          dappConfig={{ shouldUseWebViewProvider: false, logoutRoute: '/' }}
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
