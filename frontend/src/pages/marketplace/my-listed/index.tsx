import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSdk } from '../../../components/stubs/SdkStubs';
import MarketplaceNav from '../../../components/marketplace/MarketplaceNav';
import { contractService, Listing } from '../../../services/contractService';

export default function MyListed() {
  const sdk = useSdk();
  const navigate = useNavigate();
  const isAuthenticated = sdk.isAuthenticated;
  const address = sdk.address;
  const [isMobile, setIsMobile] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isAuthenticated && address) {
      fetchMyListings();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, address]);

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const data = await contractService.getAllListings(100);
      const my = data.filter(l => l.seller === address);
      setListings(my);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#0f172a' }}>
      <MarketplaceNav />

      <div style={{
        padding: isMobile ? '2rem 1rem' : '3rem 2rem',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, transparent 50%, rgba(168,85,247,0.1) 100%)'
      }}>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: isMobile ? '2rem' : '3rem',
            fontWeight: 800,
            marginBottom: '1rem',
            color: '#fff',
            lineHeight: 1.2
          }}
        >
          My <span style={{ color: '#00d4ff' }}>Listed</span> NFTs
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            color: '#94a3b8',
            fontSize: isMobile ? '1rem' : '1.25rem',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: 1.6
          }}
        >
          All NFTs you have listed on the marketplace.
        </motion.p>
      </div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: isMobile ? '1rem 0.5rem' : '2rem'
      }}>
        {!isAuthenticated ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Wallet Not Connected</h3>
            <p>Please connect your wallet to view your listings.</p>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(0, 212, 255, 0.1)',
              borderTop: '3px solid #00d4ff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            Loading your listings...
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Listings Found</h3>
            <p>You don't have any active listings.</p>
            <button
              onClick={() => navigate('/create-nft')}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '8px',
                color: '#00d4ff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Create Listing
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: isMobile ? '0.75rem' : '1.5rem'
          }}>
            {listings.map((listing) => (
              <div key={listing.listing_id} style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}>
                <div style={{
                  aspectRatio: '1/1',
                  background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(168,85,247,0.2))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? '2.5rem' : '3.5rem',
                  position: 'relative'
                }}>
                  🎨
                  <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    background: 'rgba(0,0,0,0.6)',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    color: '#00d4ff',
                    border: '1px solid rgba(0,212,255,0.3)'
                  }}>
                    #{listing.listing_id}
                  </div>
                </div>
                <div style={{ padding: isMobile ? '0.75rem' : '1rem' }}>
                  <p style={{
                    margin: '0 0 0.25rem',
                    color: '#64748b',
                    fontSize: isMobile ? '0.7rem' : '0.8rem'
                  }}>
                    {listing.token_id}
                  </p>
                  <h4 style={{
                    margin: '0 0 0.75rem',
                    color: '#fff',
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    Nonce: {listing.token_nonce}
                  </h4>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <p style={{
                      margin: 0,
                      color: '#00d4ff',
                      fontWeight: 700,
                      fontSize: isMobile ? '1rem' : '1.1rem'
                    }}>
                      {contractService.formatEGLD(listing.price_amount)} EGLD
                    </p>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      background: 'rgba(34,197,94,0.1)',
                      border: '1px solid rgba(34,197,94,0.3)',
                      borderRadius: '20px',
                      color: '#22c55e',
                      fontSize: '0.7rem',
                      fontWeight: 600
                    }}>
                      Active
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
