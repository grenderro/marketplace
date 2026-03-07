// pages/marketplace/nfts/index.tsx
import React from 'react';
import {
  useSdk,
  CompetitionBanner,
  TrendingCollections,
  NFTFilters,
  NFTGrid,
  LiveAuctions
} from '../../../components/stubs/SdkStubs';

export default function NFTMarketplace() {
  const { isAuthenticated, address } = useSdk();

  const handleCreateListing = () => {
    if (!isAuthenticated) {
      alert('Please connect your wallet first');
      return;
    }
    console.log('Creating new listing...');
    // Navigate to create listing page or open modal
  };

  const handleCreateCollection = () => {
    if (!isAuthenticated) {
      alert('Please connect your wallet first');
      return;
    }
    console.log('Creating new collection...');
    // Navigate to create collection page or open modal
  };

  const handleCreateNFT = () => {
    if (!isAuthenticated) {
      alert('Please connect your wallet first');
      return;
    }
    console.log('Creating new NFT...');
    // Navigate to mint NFT page or open modal
  };

  // Common button styles for all action buttons
  const buttonBaseStyle = {
    padding: '0.875rem 1.5rem',
    fontSize: '0.95rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: isAuthenticated ? 'pointer' : 'not-allowed',
    opacity: isAuthenticated ? 1 : 0.6,
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #00d4ff 0%, #2dd4bf 100%)',
    color: '#000',
    transition: 'all 0.2s ease',
    boxShadow: isAuthenticated ? '0 4px 15px rgba(0, 212, 255, 0.3)' : 'none',
    minWidth: '160px',
    justifyContent: 'center'
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isAuthenticated) {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.4)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = isAuthenticated ? '0 4px 15px rgba(0, 212, 255, 0.3)' : 'none';
  };

  return (
    <div className="min-h-screen">
      {/* Competition Banner */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 2rem 0' }}>
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(45, 212, 191, 0.15) 100%)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          textAlign: 'center',
          padding: '2.5rem',
          marginBottom: '1.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Glow effect */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              color: 'var(--text-primary)'
            }}>
              Trading Competition
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0' }}>
              Win up to 100 EGLD in prizes!
            </p>
          </div>
        </div>

        {/* Action Buttons Bar - Separated from Competition Banner */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleCreateListing}
            style={buttonBaseStyle}
            disabled={!isAuthenticated}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <span style={{ fontSize: '1.25rem' }}>+</span>
            Create Listing
          </button>

          <button
            onClick={handleCreateCollection}
            style={buttonBaseStyle}
            disabled={!isAuthenticated}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <span style={{ fontSize: '1.25rem' }}>📁</span>
            Create Collection
          </button>

          <button
            onClick={handleCreateNFT}
            style={buttonBaseStyle}
            disabled={!isAuthenticated}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <span style={{ fontSize: '1.25rem' }}>🎨</span>
            Create NFT
          </button>
        </div>

        {/* Authentication Hint */}
        {!isAuthenticated && (
          <div style={{
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'rgba(245, 158, 11, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(245, 158, 11, 0.2)'
            }}>
              <span>🔒</span>
              Connect wallet to create listings, collections, and NFTs
            </p>
          </div>
        )}
      </div>

      {/* Hero Section */}
      <div style={{
        padding: '2rem 0',
        textAlign: 'center',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '2rem'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>
          Discover & Collect <span className="gradient-text">Extraordinary NFTs</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Buy, sell, and auction unique digital assets on the most advanced NFT marketplace in the MultiversX ecosystem.
        </p>

        {!isAuthenticated && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem 1.5rem',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#f59e0b'
          }}>
            <span>⚠️</span>
            <span>Connect your wallet to buy, sell, and create NFT listings</span>
          </div>
        )}
      </div>

      {/* Trending Collections Marquee */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
        <TrendingCollections />
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '2rem', flexDirection: 'row' }}>
          {/* Sidebar Filters */}
          <aside className="sidebar" style={{ width: '280px', flexShrink: 0 }}>
            <NFTFilters />
          </aside>

          {/* NFT Grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }} className="gradient-text">
                Explore NFTs
              </h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Discover unique digital assets from top creators
              </p>
            </div>

            <NFTGrid
              listings={[]}
              viewMode="grid"
              onBuy={() => console.log('Buy clicked')}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>
      </div>

      {/* Live Auctions Section */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem 3rem' }}>
        <LiveAuctions />
      </div>
    </div>
  );
}
