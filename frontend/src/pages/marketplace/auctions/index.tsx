// pages/marketplace/auctions/index.tsx
import React, { useState } from 'react';
import { useSdk } from '../../../components/stubs/SdkStubs';

// Mock data for latest bid
const LATEST_BID = {
  bidder: 'erd1qq...x2jd',
  amount: '5.5 EGLD',
  item: 'Cyber Punk #3042',
  time: '2 minutes ago'
};

// Local stub components
const AuctionFilters = () => (
  <div style={{ 
    padding: '1.5rem', 
    background: 'rgba(255,255,255,0.05)', 
    borderRadius: '12px', 
    border: '1px solid rgba(255,255,255,0.1)'
  }}>
    <h3 style={{ marginBottom: '1rem', fontWeight: 600, color: '#fff' }}>Filters</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>Status</label>
        <select style={{ 
          width: '100%', 
          padding: '0.5rem', 
          background: 'rgba(0,0,0,0.3)', 
          border: '1px solid rgba(255,255,255,0.1)', 
          borderRadius: '8px', 
          color: '#fff' 
        }}>
          <option>All Auctions</option>
          <option>Active</option>
          <option>Ending Soon</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>Category</label>
        <select style={{ 
          width: '100%', 
          padding: '0.5rem', 
          background: 'rgba(0,0,0,0.3)', 
          border: '1px solid rgba(255,255,255,0.1)', 
          borderRadius: '8px', 
          color: '#fff' 
        }}>
          <option>All Categories</option>
          <option>Art</option>
          <option>Gaming</option>
          <option>Music</option>
        </select>
      </div>
    </div>
  </div>
);

const TrendingAuctions = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
    {[1, 2, 3, 4].map((i) => (
      <div key={i} style={{ 
        padding: '1rem', 
        background: 'rgba(255,255,255,0.05)', 
        borderRadius: '12px', 
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ 
          width: '100%', 
          height: '150px', 
          background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(45,212,191,0.2))', 
          borderRadius: '8px', 
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem'
        }}>
          🎨
        </div>
        <p style={{ fontWeight: 600, color: '#fff' }}>Trending Item #{i}</p>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>24h volume: 120 EGLD</p>
      </div>
    ))}
  </div>
);

export default function LiveAuctions() {
  const { isAuthenticated } = useSdk();
  const [showPastAuctions, setShowPastAuctions] = useState(false);

  const handleCreateAuction = () => {
    if (!isAuthenticated) {
      alert('Please connect your wallet first');
      return;
    }
    console.log('Creating new auction...');
  };

  const handlePastAuctions = () => {
    setShowPastAuctions(!showPastAuctions);
  };

  const buttonBaseStyle: React.CSSProperties = {
    padding: '0.875rem 1.5rem',
    fontSize: '0.95rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #00d4ff 0%, #2dd4bf 100%)',
    color: '#000',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
    minWidth: '160px',
    justifyContent: 'center'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff' }}>
      {/* New Bids Banner */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 2rem 0' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(234, 179, 8, 0.15) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          padding: '1.5rem 2rem',
          marginBottom: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          borderRadius: '16px'
        }}>
          {/* Pulse line */}
          <div style={{
            position: 'absolute',
            left: '0',
            top: '0',
            bottom: '0',
            width: '4px',
            background: '#f59e0b',
            animation: 'pulse 2s infinite'
          }} />

          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            flexShrink: 0
          }}>
            🔥
          </div>

          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <span style={{
                background: '#f59e0b',
                color: '#000',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '700',
                textTransform: 'uppercase'
              }}>
                New Bid
              </span>
              <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                {LATEST_BID.time}
              </span>
            </div>
            
            <div style={{ color: '#9ca3af' }}>
              <strong style={{ color: '#f59e0b' }}>{LATEST_BID.bidder}</strong> bid{' '}
              <strong style={{ color: '#f59e0b', fontSize: '1.25rem' }}>{LATEST_BID.amount}</strong> on{' '}
              <strong style={{ color: '#fff' }}>{LATEST_BID.item}</strong>
            </div>
          </div>

          <button
            onClick={() => console.log('View bid details')}
            style={{
              padding: '0.625rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              borderRadius: '8px',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              background: 'transparent',
              color: '#f59e0b',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
              e.currentTarget.style.borderColor = '#f59e0b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)';
            }}
          >
            View Details →
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleCreateAuction}
            style={{
              ...buttonBaseStyle,
              opacity: isAuthenticated ? 1 : 0.6,
              cursor: isAuthenticated ? 'pointer' : 'not-allowed'
            }}
            disabled={!isAuthenticated}
            onMouseEnter={(e) => {
              if (isAuthenticated) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 212, 255, 0.3)';
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>➕</span>
            Create Auction
          </button>

          <button
            onClick={handlePastAuctions}
            style={buttonBaseStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 212, 255, 0.3)';
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>📜</span>
            {showPastAuctions ? 'Active Auctions' : 'Past Auctions'}
          </button>
        </div>

        {!isAuthenticated && (
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <p style={{
              color: '#9ca3af',
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
              Connect wallet to create auctions
            </p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem 3rem' }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            {showPastAuctions ? 'Past Auctions' : 'Live Auctions'}
          </h1>
          <p style={{ color: '#9ca3af', maxWidth: '600px', margin: '0 auto' }}>
            {showPastAuctions 
              ? 'Browse completed auctions and final sale prices.' 
              : 'Bid on exclusive NFTs and digital assets in real-time.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexDirection: 'row' }}>
          <aside style={{ width: '280px', flexShrink: 0 }}>
            <AuctionFilters />
          </aside>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {showPastAuctions ? 'Completed Auctions' : 'Active Auctions'}
              </h2>
              {!showPastAuctions && <span style={{ color: '#9ca3af' }}>🔴 12 Active</span>}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {showPastAuctions ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '4rem', 
                  color: '#9ca3af',
                  gridColumn: '1 / -1',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '16px',
                  border: '1px dashed rgba(255,255,255,0.1)'
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📜</div>
                  <h3>No past auctions to display</h3>
                  <p>Check back later for completed auction history</p>
                </div>
              ) : (
                [1, 2, 3].map((i) => (
                  <div key={i} style={{ 
                    height: '400px', 
                    background: 'rgba(255,255,255,0.05)', 
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    Auction Card Placeholder {i}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {!showPastAuctions && (
          <div style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Trending Auctions
            </h2>
            <TrendingAuctions />
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
