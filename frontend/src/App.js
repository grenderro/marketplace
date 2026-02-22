import React, { useEffect, useState } from 'react';
import { useContract } from './hooks/useContract';
import { useDeFiWallet } from './hooks/useDeFiWallet';
import './App.css';

const LOGO_URL = 'https://sapphire-acute-anaconda-630.mypinata.cloud/ipfs/bafybeiegq45s2v4qixkghaz74ttknojllmw75wmb2wxl6bqyvyccfa2eve';

function App() {
  const { fetchListingCount, fetchAllListings, loading } = useContract();
  const { account, isConnected, isInstalled, connect, disconnect, refreshConnection } = useDeFiWallet();
  const [stats, setStats] = useState({ listings: 0, volume: '0' });
  const [recentListings, setRecentListings] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const count = await fetchListingCount();
    const listings = await fetchAllListings();
    setStats({
      listings: count,
      volume: calculateVolume(listings)
    });
    setRecentListings(listings.slice(0, 4));
  };

  const calculateVolume = (listings) => {
    const total = listings.reduce((sum, l) => sum + parseInt(l.price || 0), 0);
    return (total / 1e18).toFixed(2);
  };

  const handleConnect = async () => {
    const result = await connect();
    if (!result.success && result.error) {
      alert(result.error);
    }
  };

  return (
    <div className="trad3e-app">
      <header className="trad3e-header">
        <div className="logo-container">
          <img src={LOGO_URL} alt="Trad3E" className="logo-img" />
          <h1 className="logo-text">TRAD3E</h1>
        </div>
        
{isConnected ? (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <span style={{ color: '#00ffd1', fontFamily: 'monospace' }}>
      {account.slice(0, 6)}...{account.slice(-4)}
    </span>
    <button className="connect-btn" onClick={disconnect}>
      DISCONNECT
    </button>
  </div>
) : (
  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', alignItems: 'flex-end' }}>
    <button className="connect-btn" onClick={connect}>
      CONNECT WEB WALLET
    </button>
    <small style={{ color: '#666', fontSize: '0.7rem' }}>
      You'll return here after login
    </small>
  </div>
)}
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">
            <span className="neon-cyan">WEB3</span> MARKETPLACE<br />
            ON MULTIVERSX
          </h2>
          
          <div className="hero-stats">
            <div className="h-stat">
              <span className="h-number">{stats.listings}</span>
              <span className="h-label">LISTINGS</span>
            </div>
            <div className="h-stat">
              <span className="h-number">{stats.volume}</span>
              <span className="h-label">VOLUME (EGLD)</span>
            </div>
          </div>
        </div>
      </section>

      <section className="services-section">
        <h3 className="section-title">ACTIVE LISTINGS</h3>
        {loading ? (
          <div className="loading-contract">Loading from blockchain...</div>
        ) : (
          <div className="listings-grid">
            {recentListings.length > 0 ? (
              recentListings.map((listing, idx) => (
                <div key={idx} className="listing-card">
                  <div className="listing-header">
                    <span className="listing-id">#{listing.id}</span>
                    <span className="listing-status">{listing.status}</span>
                  </div>
                  <div className="listing-body">
                    <p className="listing-token">{listing.nft_token_id}</p>
                    <p className="listing-price">{(parseInt(listing.price) / 1e18).toFixed(2)} EGLD</p>
                  </div>
                  <button 
                    className="buy-btn" 
                    disabled={!isConnected}
                    style={{ 
                      opacity: isConnected ? 1 : 0.5,
                      cursor: isConnected ? 'pointer' : 'not-allowed',
                      background: 'transparent',
                      border: '1px solid #00ffd1',
                      color: '#00ffd1',
                      padding: '0.5rem 1rem',
                      marginTop: '1rem',
                      borderRadius: '8px'
                    }}
                  >
                    {isConnected ? 'BUY NOW' : 'CONNECT WALLET TO BUY'}
                  </button>
                </div>
              ))
            ) : (
              <p className="no-listings">No active listings found</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
