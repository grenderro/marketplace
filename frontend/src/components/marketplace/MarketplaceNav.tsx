import React from 'react';

export const MarketplaceNav: React.FC = () => {
  const currentPath = window.location.pathname;

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
      {/* Logo and Brand */}
      <a href="/explore" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        textDecoration: 'none'
      }}>
        {/* Logo Image from IPFS */}
        <img 
          src="https://sapphire-acute-anaconda-630.mypinata.cloud/ipfs/bafybeiegq45s2v4qixkghaz74ttknojllmw75wmb2wxl6bqyvyccfa2eve"
          alt="Trad3E Logo"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            objectFit: 'cover',
            boxShadow: '0 0 15px rgba(0, 212, 255, 0.4)'
          }}
        />

        {/* Brand Name */}
        <span style={{
          fontSize: '1.5rem',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #00d4ff 0%, #2dd4bf 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em'
        }}>
          Trad3E
        </span>
      </a>

      {/* Navigation Links */}
      <div style={{ display: 'flex', gap: '2rem' }}>
        <a
          href="/marketplace/nfts"
          style={{
            color: currentPath.includes('/nfts') ? '#00d4ff' : '#94a3b8',
            textDecoration: 'none',
            fontWeight: currentPath.includes('/nfts') ? '600' : '500',
            fontSize: '1rem',
            padding: '0.5rem 0',
            position: 'relative',
            transition: 'all 0.3s ease'
          }}
        >
          NFTs
          {currentPath.includes('/nfts') && (
            <span style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              height: '2px',
              background: 'linear-gradient(135deg, #00d4ff 0%, #2dd4bf 100%)',
              boxShadow: '0 0 10px #00d4ff'
            }} />
          )}
        </a>

        <a
          href="/marketplace/esdt"
          style={{
            color: currentPath.includes('/esdt') ? '#00d4ff' : '#94a3b8',
            textDecoration: 'none',
            fontWeight: currentPath.includes('/esdt') ? '600' : '500',
            fontSize: '1rem',
            padding: '0.5rem 0',
            position: 'relative',
            transition: 'all 0.3s ease'
          }}
        >
          ESDT
          {currentPath.includes('/esdt') && (
            <span style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              height: '2px',
              background: 'linear-gradient(135deg, #00d4ff 0%, #2dd4bf 100%)',
              boxShadow: '0 0 10px #00d4ff'
            }} />
          )}
        </a>

        {/* Live Auctions - New Navigation Item */}
        <a
          href="/marketplace/auctions"
          style={{
            color: currentPath.includes('/auctions') ? '#00d4ff' : '#94a3b8',
            textDecoration: 'none',
            fontWeight: currentPath.includes('/auctions') ? '600' : '500',
            fontSize: '1rem',
            padding: '0.5rem 0',
            position: 'relative',
            transition: 'all 0.3s ease'
          }}
        >
          Live Auctions
          {currentPath.includes('/auctions') && (
            <span style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              height: '2px',
              background: 'linear-gradient(135deg, #00d4ff 0%, #2dd4bf 100%)',
              boxShadow: '0 0 10px #00d4ff'
            }} />
          )}
        </a>

        <a
          href="/explore"
          style={{
            color: currentPath === '/explore' ? '#00d4ff' : '#94a3b8',
            textDecoration: 'none',
            fontWeight: currentPath === '/explore' ? '600' : '500',
            fontSize: '1rem',
            padding: '0.5rem 0',
            position: 'relative',
            transition: 'all 0.3s ease'
          }}
        >
          Explore
          {currentPath === '/explore' && (
            <span style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              height: '2px',
              background: 'linear-gradient(135deg, #00d4ff 0%, #2dd4bf 100%)',
              boxShadow: '0 0 10px #00d4ff'
            }} />
          )}
        </a>
      </div>
    </nav>
  );
};

export default MarketplaceNav;
