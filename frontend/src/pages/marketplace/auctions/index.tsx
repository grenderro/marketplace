import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSdk } from '../../../components/stubs/SdkStubs';
import MarketplaceNav from '../../../components/marketplace/MarketplaceNav';
import { contractService, Auction } from '../../../services/contractService';

interface Filters {
  sortBy: string;
  status: 'all' | 'active' | 'ending';
  minPrice: string;
  maxPrice: string;
}

export default function LiveAuctions() {
  const sdk = useSdk();
  const isAuthenticated = sdk.isAuthenticated;
  const address = sdk.address;
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState<number | null>(null);
  const [filters, setFilters] = useState<Filters>({
    sortBy: 'recent',
    status: 'active',
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setShowFilters(false);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    fetchAuctions();
    
    // Refresh every 30 seconds for live bid updates
    const interval = setInterval(fetchAuctions, 30000);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, []);

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const data = await contractService.getAllAuctions(20);
      setAuctions(data);
    } catch (error) {
      console.error('Failed to fetch auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeLeft = (endTime: number): string => {
    const now = Math.floor(Date.now() / 1000);
    const diff = endTime - now;
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handlePlaceBid = async (auction: Auction) => {
    if (!isAuthenticated) {
      alert('Please connect your wallet');
      return;
    }

    // Calculate minimum bid (10% above current or min_bid)
    const currentBidBigInt = BigInt(auction.highest_bid || '0');
    const minBidBigInt = currentBidBigInt > 0 
      ? (currentBidBigInt * BigInt(110)) / BigInt(100)  // +10%
      : BigInt(auction.min_bid);
    
    const minBidEGLD = contractService.formatEGLD(minBidBigInt.toString());

    const bidAmount = prompt(`Enter bid amount in EGLD (minimum: ${minBidEGLD})`);
    if (!bidAmount) return;

    const bidAmountBigInt = BigInt(Math.floor(parseFloat(bidAmount) * 1e18));
    
    if (bidAmountBigInt < minBidBigInt) {
      alert(`Bid too low! Minimum is ${minBidEGLD} EGLD`);
      return;
    }

    setBidding(auction.auction_id);
    try {
      const tx = contractService.buildBidTransaction(
        auction.auction_id,
        auction.payment_token,
        bidAmountBigInt.toString()
      );
      
      console.log('Bid transaction:', tx);
      alert(`Bid transaction ready for auction #${auction.auction_id}`);
      
      // In production: await sdk.sendTransaction(tx);
      
      setTimeout(fetchAuctions, 3000); // Refresh after bid
    } catch (error) {
      console.error('Bid failed:', error);
      alert('Bid failed: ' + error);
    } finally {
      setBidding(null);
    }
  };

  const handleEndAuction = async (auction: Auction) => {
    if (getTimeLeft(auction.end_time) !== 'Ended') {
      alert('Auction has not ended yet');
      return;
    }

    try {
      alert(`Ending auction #${auction.auction_id}...`);
      // In production: call contractService.endAuction
      await fetchAuctions();
    } catch (error) {
      alert('Failed to end auction: ' + error);
    }
  };

  // Filter auctions
  const filteredAuctions = auctions.filter(auction => {
    if (filters.status === 'ending') {
      const timeLeft = auction.end_time - Math.floor(Date.now() / 1000);
      return timeLeft > 0 && timeLeft < 3600; // Less than 1 hour
    }
    if (filters.status === 'active') {
      return auction.active && getTimeLeft(auction.end_time) !== 'Ended';
    }
    return true;
  });

  return (
    <div className="min-h-screen" style={{ background: '#0f172a' }}>
      <MarketplaceNav />
      
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: isMobile ? '1rem 0.5rem 2rem' : '2rem'
      }}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >
          <h1 style={{ 
            fontSize: isMobile ? '1.75rem' : '2.5rem', 
            fontWeight: 800, 
            color: '#fff'
          }}>
            Live <span style={{ color: '#f59e0b' }}>Auctions</span>
          </h1>
          <p style={{ color: '#94a3b8' }}>
            {loading ? 'Loading from devnet blockchain...' : `${filteredAuctions.length} active auctions`}
          </p>
        </motion.div>

        {/* Mobile Filter Toggle */}
        {isMobile && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: showFilters ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              color: '#f59e0b',
              fontWeight: 600,
              marginBottom: '1rem',
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
            display: isMobile && !showFilters ? 'none' : 'block',
            flexShrink: 0
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: isMobile ? '1rem' : '1.5rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: '#fff' }}>
                Filters
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                    Status
                  </label>
                  <select 
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value as any})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="ending">Ending Soon (&lt;1h)</option>
                    <option value="all">All</option>
                  </select>
                </div>

                <button 
                  onClick={() => {
                    setFilters({ sortBy: 'recent', status: 'active', minPrice: '', maxPrice: '' });
                    fetchAuctions();
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'transparent',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '8px',
                    color: '#f59e0b',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Refresh / Clear
                </button>
              </div>
            </div>
          </aside>

          {/* Auction Grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  border: '3px solid rgba(245, 158, 11, 0.1)',
                  borderTop: '3px solid #f59e0b',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 1rem'
                }} />
                Loading auctions from blockchain...
              </div>
            ) : filteredAuctions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔨</div>
                <h3 style={{ color: '#fff' }}>No active auctions</h3>
                <p>Start the first auction on the marketplace!</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: isMobile ? '0.75rem' : '1.5rem'
              }}>
                {filteredAuctions.map((auction) => (
                  <div key={auction.auction_id} style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div style={{
                      aspectRatio: '16/10',
                      background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(234,179,8,0.2))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isMobile ? '2rem' : '3rem',
                      position: 'relative'
                    }}>
                      🎨
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: getTimeLeft(auction.end_time) === 'Ended' ? '#ef4444' : 'rgba(245, 158, 11, 0.9)',
                        color: '#000',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {getTimeLeft(auction.end_time)}
                      </div>
                    </div>
                    <div style={{ padding: isMobile ? '0.75rem' : '1rem' }}>
                      <h4 style={{ 
                        margin: '0 0 0.5rem', 
                        color: '#fff', 
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {auction.token_id} #{auction.token_nonce}
                      </h4>
                      
                      <div style={{ marginBottom: '0.75rem' }}>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem' }}>
                          Seller: {auction.seller.slice(0, 6)}...{auction.seller.slice(-4)}
                        </p>
                        {auction.highest_bidder && (
                          <p style={{ margin: '0.25rem 0 0', color: '#22c55e', fontSize: '0.75rem' }}>
                            Top: {auction.highest_bidder.slice(0, 6)}... ({contractService.formatEGLD(auction.highest_bid)} EGLD)
                          </p>
                        )}
                      </div>

                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? '0.5rem' : '0'
                      }}>
                        <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                          <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem' }}>
                            {auction.highest_bid > '0' ? 'Current Bid' : 'Min Bid'}
                          </p>
                          <p style={{ margin: 0, color: '#f59e0b', fontWeight: 700, fontSize: isMobile ? '1rem' : '1.1rem' }}>
                            {contractService.formatEGLD(auction.highest_bid > '0' ? auction.highest_bid : auction.min_bid)} EGLD
                          </p>
                        </div>
                        
                        {getTimeLeft(auction.end_time) === 'Ended' ? (
                          <button
                            onClick={() => handleEndAuction(auction)}
                            style={{
                              padding: isMobile ? '0.4rem 0.75rem' : '0.5rem 1rem',
                              background: '#22c55e',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#fff',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: isMobile ? '0.75rem' : '0.875rem',
                              width: isMobile ? '100%' : 'auto'
                            }}
                          >
                            End Auction
                          </button>
                        ) : (
                          <button 
                            onClick={() => handlePlaceBid(auction)}
                            disabled={bidding === auction.auction_id}
                            style={{
                              padding: isMobile ? '0.4rem 0.75rem' : '0.5rem 1rem',
                              background: 'rgba(245, 158, 11, 0.1)',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              borderRadius: '8px',
                              color: '#f59e0b',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: isMobile ? '0.75rem' : '0.875rem',
                              width: isMobile ? '100%' : 'auto',
                              opacity: bidding === auction.auction_id ? 0.5 : 1
                            }}
                          >
                            {bidding === auction.auction_id ? '...' : 'Place Bid'}
                          </button>
                        )}
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
