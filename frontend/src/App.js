import React, { useEffect, useState } from 'react';
import { useContract } from './hooks/useContract';
import { useDeFiWallet } from './hooks/useDeFiWallet';
import './App.css';

const API_URL = 'http://localhost:3001/api';
const LOGO_URL = 'https://sapphire-acute-anaconda-630.mypinata.cloud/ipfs/bafybeiegq45s2v4qixkghaz74ttknojllmw75wmb2wxl6bqyvyccfa2eve';

function App() {
  const { fetchListingCount, fetchAllListings, loading } = useContract();
  const { account, isConnected, isInstalled, connect, disconnect, refreshConnection } = useDeFiWallet();
  
  const [stats, setStats] = useState({ listings: 0, volume: '0' });
  const [backendStats, setBackendStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);

  useEffect(() => {
    // Load blockchain data
    loadBlockchainData();
    
    // Load backend data
    loadBackendData();
  }, []);

  const loadBlockchainData = async () => {
    try {
      const count = await fetchListingCount();
      setStats({ listings: count, volume: '0' });
    } catch (err) {
      console.error('Blockchain error:', err);
    }
  };

  const loadBackendData = async () => {
    try {
      // Fetch from your Node.js backend
      const statsRes = await fetch(`${API_URL}/analytics/stats`);
      const statsData = await statsRes.json();
      setBackendStats(statsData);

      const lbRes = await fetch(`${API_URL}/analytics/leaderboard`);
      const lbData = await lbRes.json();
      setLeaderboard(lbData);
    } catch (err) {
      console.error('Backend error:', err);
    }
  };

  return (
    <div className="App" style={{padding: 20, fontFamily: 'sans-serif'}}>
      <h1>Trad3EX Marketplace</h1>
      <img src={LOGO_URL} alt="Logo" style={{width: 100, height: 100}} />
      
      <div style={{marginTop: 20, padding: 20, background: '#f0f0f0', borderRadius: 10}}>
        <h2>🔗 Blockchain Connection</h2>
        <p>Connected: {isConnected ? '✅ Yes' : '❌ No'}</p>
        <p>Listings: {stats.listings}</p>
        {!isConnected && (
          <button onClick={connect} style={{padding: '10px 20px', marginTop: 10}}>
            Connect Wallet
          </button>
        )}
      </div>

      <div style={{marginTop: 20, padding: 20, background: '#e0f0e0', borderRadius: 10}}>
        <h2>📊 Backend Analytics (PostgreSQL)</h2>
        <h3>Global Stats</h3>
        <pre style={{background: '#fff', padding: 10, borderRadius: 5}}>
          {JSON.stringify(backendStats, null, 2)}
        </pre>
        
        <h3>Leaderboard</h3>
        <pre style={{background: '#fff', padding: 10, borderRadius: 5}}>
          {JSON.stringify(leaderboard, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default App;
