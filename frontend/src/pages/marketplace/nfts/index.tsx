import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSdk } from '../../../components/stubs/SdkStubs';
import MarketplaceNav from '../../../components/marketplace/MarketplaceNav';
import { contractService, Listing } from '../../../services/contractService';

interface Filters {
  sortBy: string;
  priceRange: string;
}

export default function NFTMarketplace() {
  const sdk = useSdk();
  const isAuthenticated = sdk.isAuthenticated;
  const address = sdk.address;
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<number | null>(null);
  const [filters, setFilters] = useState<Filters>({
    sortBy: 'recent',
    priceRange: 'all',
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setShowFilters(false);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    fetchListings();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchListings, 30000);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await contractService.getAllListings(20);
      setListings(data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (listing: Listing) => {
    if (!isAuthenticated) {
      alert('Please connect your wallet first');
      return;
    }

    if (listing.seller === address) {
      alert('You cannot buy your own listing');
      return;
    }

    const confirmed = window.confirm(
      `Buy ${listing.token_id} for ${contractService.formatEGLD(listing.price_amount)} EGLD?`
    );

    if (!confirmed) return;

    setBuying(listing.listing_id);
    try {
      // Build transaction for wallet to sign
      const tx = contractService.buildBuyTransaction(
        listing.listing_id,
        listing.price_token,
        listing.price_amount
      );
      
      console.log('Transaction to sign:', tx);
      alert('Transaction ready. Check console for details.\n\nListing ID: ' + listing.listing_id);
      
      // In production, this would be:
      // await sdk.sendTransaction(tx);
      
      // Refresh after "buy"
      setTimeout(fetchListings, 2000);
    } catch (error) {
      console.error('Buy failed:', error);
      alert('Transaction failed: ' + error);
    } finally {
      setBuying(null);
    }
  };

  // Filter listings by price
  const filteredListings = listings.filter(listing => {
    if (filters.priceRange === 'low') {
      return BigInt(listing.price_amount) < BigInt(1e18); // < 1 EGLD
    }
    if (filters.priceRange === 'mid') {
      return BigInt(listing.price_amount) >= BigInt(1e18) && BigInt(listing.price_amount) < BigInt(10e18);
    }
    if (filters.priceRange === 'high') {
      return BigInt(listing.price_amount) >= BigInt(10e18); // > 10 EGLD
    }
    return true;
  });

  return (
    <div className="min-h-screen" style={{ background: '#0f172a' }}>
      <MarketplaceNav />
      
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: isMobile ? '1rem 0.5rem' : '2rem'
      }}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            padding: isMobile ? '0 0.5rem' : 0
          }}
        >
          <h1 style={{ 
            fontSize: isMobile ? '1.75rem' : '2.5rem', 
            fontWeight: 800, 
            marginBottom: '0.5rem',
            color: '#fff'
          }}>
            NFT <span style={{ color: '#00d4ff' }}>Marketplace</span>
          </h1>
          <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
            {loading ? 'Loading from devnet blockchain...' : `${filteredListings.length} items listed`}
          </p>
        </motion.div>

        {/* Mobile Filter Toggle */}
        {isMobile && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: showFilters ? 'rgba(0, 212, 255, 0.2)' : 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: '12px',
              color: '#00d4ff',
              fontWeight: 600,
              marginBottom: '1rem',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            {showFilters ? '✕ Close' : '☰'} Filters
          </button>
        )}

        <div style={{ 
          display: 'flex', 
          gap: '2rem', 
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          {/* Sidebar Filters */}
          <aside style={{ 
            width: isMobile ? '100%' : '280px', 
            minWidth: isMobile ? 'auto' : '280px',
            flexShrink: 0,
            display: isMobile && !showFilters ? 'none' : 'block'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: isMobile ? '1rem' : '1.5rem',
              border: '1px solid rgba(255,255,255,0.1)',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <h3 style={{ 
                marginBottom: '1.5rem', 
                fontSize: '1.1rem', 
                fontWeight: 600,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                Filters
                {isMobile && (
                  <button 
                    onClick={() => setShowFilters(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      fontSize: '1.25rem',
                      cursor: 'pointer',
                      padding: '0.25rem'
                    }}
                  >
                    ✕
                  </button>
                )}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: '#94a3b8', 
                    fontSize: '0.875rem' 
                  }}>
                    Price Range
                  </label>
                  <select 
                    value={filters.priceRange}
                    onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Prices</option>
                    <option value="low">Under 1 EGLD</option>
                    <option value="mid">1 - 10 EGLD</option>
                    <option value="high">Over 10 EGLD</option>
                  </select>
                </div>

                <button 
                  onClick={() => {
                    setFilters({ sortBy: 'recent', priceRange: 'all' });
                    fetchListings();
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'transparent',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: '8px',
                    color: '#00d4ff',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Refresh / Clear
                </button>
              </div>
            </div>
          </aside>

          {/* NFT Grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
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
                Loading from blockchain...
              </div>
            ) : filteredListings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No active listings</h3>
                <p>No NFTs currently listed on the marketplace.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: isMobile ? '0.75rem' : '1.5rem'
              }}>
                {filteredListings.map((listing) => (
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
                        Seller: {listing.seller.slice(0, 8)}...{listing.seller.slice(-4)}
                      </h4>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? '0.5rem' : '0'
                      }}>
                        <div>
                          <p style={{ 
                            margin: 0, 
                            color: '#00d4ff', 
                            fontWeight: 700, 
                            fontSize: isMobile ? '1rem' : '1.1rem' 
                          }}>
                            {contractService.formatEGLD(listing.price_amount)} EGLD
                          </p>
                          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.7rem' }}>
                            Nonce: {listing.token_nonce}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleBuy(listing)}
                          disabled={buying === listing.listing_id}
                          style={{
                            padding: isMobile ? '0.4rem 0.75rem' : '0.5rem 1rem',
                            background: isAuthenticated ? 'rgba(0, 212, 255, 0.1)' : 'rgba(100,100,100,0.1)',
                            border: `1px solid ${isAuthenticated ? 'rgba(0, 212, 255, 0.3)' : 'rgba(100,100,100,0.3)'}`,
                            borderRadius: '8px',
                            color: isAuthenticated ? '#00d4ff' : '#64748b',
                            fontWeight: 600,
                            cursor: isAuthenticated ? 'pointer' : 'not-allowed',
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            width: isMobile ? '100%' : 'auto',
                            opacity: buying === listing.listing_id ? 0.5 : 1
                          }}
                        >
                          {buying === listing.listing_id ? '...' : (isAuthenticated ? 'Buy Now' : 'Connect')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
