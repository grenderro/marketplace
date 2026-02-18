import React, { useEffect, useState } from 'react';
import './App.css';

const LOGO_URL = 'https://sapphire-acute-anaconda-630.mypinata.cloud/ipfs/bafybeiegq45s2v4qixkghaz74ttknojllmw75wmb2wxl6bqyvyccfa2eve';

function App() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/analytics/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const services = [
    {
      title: 'NFT MARKETPLACE',
      desc: 'BUY, SELL, AND TRADE DIGITAL ASSETS WITH SECURE TRANSACTIONS ON MULTIVERSX.',
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      stat: stats?.active_listings || '0'
    },
    {
      title: 'DUTCH AUCTIONS',
      desc: 'DYNAMIC PRICING MECHANISM WHERE PRICES DECREASE OVER TIME UNTIL SOMEONE BUYS.',
      image: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      stat: stats?.active_auctions || '0'
    },
    {
      title: 'ANALYTICS DASHBOARD',
      desc: 'REAL-TIME INSIGHTS INTO TRADING VOLUMES, TRENDS, AND MARKET ACTIVITY.',
      image: 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      stat: `${stats?.volume_24h || '0'} EGLD`
    },
    {
      title: 'ROYALTY MANAGEMENT',
      desc: 'AUTOMATED ROYALTY DISTRIBUTION FOR CREATORS AND COLLECTION OWNERS.',
      image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      stat: '25%'
    }
  ];

  return (
    <div className="trad3e-app">
      {/* Background Effects */}
      <div className="bg-grid"></div>
      <div className="bg-glow"></div>

      {/* Header */}
      <header className="trad3e-header">
        <div className="logo-container">
          <img src={LOGO_URL} alt="Trad3E" className="logo-img" />
          <h1 className="logo-text">TRAD3E</h1>
        </div>
        <nav className="main-nav">
          <a href="#" className="nav-link active">MARKETPLACE</a>
          <a href="#" className="nav-link">AUCTIONS</a>
          <a href="#" className="nav-link">ANALYTICS</a>
          <a href="#" className="nav-link">COLLECTIONS</a>
        </nav>
        <button className="connect-btn">CONNECT WALLET</button>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          {/* REMOVED: hero-badge with MULTIVERSX ECOSYSTEM */}
          
          <h2 className="hero-title">
            YOUR PREMIUM PARTNER FOR<br />
            <span className="neon-cyan">LAUNCHING, MANAGING,</span><br />
            AND <span className="neon-green">MAXIMIZING</span> YOUR<br />
            DIGITAL ASSETS
          </h2>
          <p className="hero-subtitle">
            **MULTIVERSX BLOCKCHAIN**
          </p>
          <div className="hero-stats">
            <div className="h-stat">
              <span className="h-number">{stats?.active_listings || '0'}</span>
              <span className="h-label">LISTINGS</span>
            </div>
            <div className="h-stat">
              <span className="h-number">{stats?.active_auctions || '0'}</span>
              <span className="h-label">AUCTIONS</span>
            </div>
            <div className="h-stat">
              <span className="h-number">{stats?.unique_traders_24h || '0'}</span>
              <span className="h-label">TRADERS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="services-section">
        <h3 className="section-title">OUR ECOSYSTEM SERVICES</h3>
        <div className="services-grid">
          {services.map((service, idx) => (
            <div key={idx} className="service-card">
              <div 
                className="card-bg"
                style={{backgroundImage: `linear-gradient(135deg, rgba(0,255,209,0.1) 0%, rgba(0,0,0,0.8) 100%), url(${service.image})`}}
              ></div>
              <div className="card-border"></div>
              <div className="card-content">
                <div className="card-stat">{service.stat}</div>
                <h4 className="card-title">{service.title}</h4>
                <p className="card-desc">{service.desc}</p>
                <button className="card-btn">EXPLORE</button>
              </div>
              <div className="card-glow"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="trad3e-footer">
        <div className="footer-content">
          <img src={LOGO_URL} alt="Trad3E" className="footer-logo-img" />
          <div className="footer-links">
            <a href="#">TERMS</a>
            <a href="#">PRIVACY</a>
            <a href="#">DOCS</a>
          </div>
          <div className="footer-copy">
            © 2025 TRAD3E MARKETPLACE. POWERED BY MULTIVERSX.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
