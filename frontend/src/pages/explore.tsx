import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import MarketplaceNav from '../components/marketplace/MarketplaceNav';
import MobileFilterBar from '../components/marketplace/MobileFilterBar';
import FilterSidebar from '../components/marketplace/FilterSidebar';
import MarketplaceCard from '../components/marketplace/MarketplaceCard';
import MobileBottomNav from '../components/marketplace/MobileBottomNav';
import { useGetAccountInfo, useGetLoginInfo } from '@multiversx/sdk-dapp/hooks';

interface Listing {
  id: string;
  name: string;
  price: string;
  image: string;
  collection: string;
  seller: string;
  creator?: string;
  creatorAvatar?: string;
  likes?: number;
  isLiked?: boolean;
  isAuction?: boolean;
  endsAt?: string;
}

interface Filters {
  sortBy: string;
  type: 'all' | 'listing' | 'auction';
  minPrice: string;
  maxPrice: string;
  collection: string;
  categories: string[];
}

export default function ExplorePage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<Filters>({
    sortBy: 'recent',
    type: 'all',
    minPrice: '',
    maxPrice: '',
    collection: '',
    categories: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const { ref, inView } = useInView();
  const { address } = useGetAccountInfo();
  const { isLoggedIn } = useGetLoginInfo();
  const isAuthenticated = isLoggedIn && address;

useEffect(() => {
  // Check for address in URL (web wallet callback)
  const params = new URLSearchParams(window.location.search);
  const address = params.get('address');
  
  if (address) {
    console.log('Got address from URL:', address);
    // Store it so SDK can pick it up
    localStorage.setItem('wallet_address', address);
    
    // Reload without params
    window.history.replaceState({}, '', window.location.pathname);
    window.location.reload();
  }
}, []);

  // AUTO-PROCESS WALLET LOGIN CALLBACK - WITH DEBUG
useEffect(() => {
  console.log('Window location:', window.location.href);
  console.log('Search params:', window.location.search);
  
  const urlParams = new URLSearchParams(window.location.search);
  const addressParam = urlParams.get('address');
  const signatureParam = urlParams.get('signature');
  
  console.log('Address param:', addressParam);
  console.log('Signature param:', signatureParam);
  
  if (addressParam && signatureParam) {
    console.log('✅ Login callback detected! Processing...');
    
    // Clean URL
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
    
    // Force reload to let SDK pick up auth
    window.location.href = cleanUrl;
  } else {
    console.log('❌ No login callback params found');
  }
}, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['listings', filters, searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockListings: Listing[] = Array(8).fill(null).map((_, i) => ({
        id: `item-${pageParam}-${i}`,
        name: `Cosmic NFT #${(pageParam - 1) * 8 + i + 1}`,
        price: (0.5 + Math.random() * 10).toFixed(2),
        image: `https://picsum.photos/400/400?random=${pageParam}-${i}`,
        collection: ['Cosmic Collectibles', 'Digital Dreams', 'Crypto Art', 'Pixel Punks'][i % 4],
        seller: `erd1...${Math.random().toString(36).substring(7)}`,
        creator: ['star_artist', 'crypto_master', 'nft_wizard', 'digital_king'][i % 4],
        likes: Math.floor(Math.random() * 500),
        isLiked: Math.random() > 0.7,
        isAuction: i % 3 === 0,
        endsAt: i % 3 === 0 ? new Date(Date.now() + Math.random() * 86400000).toISOString() : undefined
      }));

      return {
        data: {
          listings: mockListings,
          hasMore: pageParam < 5,
          collections: ['Cosmic Collectibles', 'Digital Dreams', 'Crypto Art', 'Pixel Punks']
        }
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, pages) => {
      return lastPage?.data?.hasMore ? pages.length + 1 : undefined;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allListings = data?.pages.flatMap((page: any) => page?.data?.listings || []) || [];

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // FIXED: Updated handleBuy signature to match MarketplaceCard
  const handleBuy = (listing: { id: string; name: string; price: string; currency: string }) => {
    if (!isAuthenticated) {
      alert('Please connect your wallet first!');
      return;
    }
    console.log('Buying:', listing);
    alert(`Initiating purchase for ${listing.name} at ${listing.price} ${listing.currency}`);
  };

  const handleLike = (id: string) => {
    console.log('Liked:', id);
  };

  const transformedListings = allListings.map(listing => ({
    ...listing,
    currency: 'EGLD',
    endsAt: listing.endsAt ? new Date(listing.endsAt) : undefined
  }));

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <MarketplaceNav />

      {/* Hero Section */}
      <div style={{
        padding: isMobile ? '100px 1rem 2rem' : '120px 2rem 3rem',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'linear-gradient(180deg, rgba(0,212,255,0.05) 0%, transparent 100%)'
      }}>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: isMobile ? '2rem' : '3.5rem',
            fontWeight: 800,
            marginBottom: '1rem',
            color: '#fff',
            lineHeight: 1.2
          }}
        >
          Discover <span style={{ color: '#00d4ff' }}>Extraordinary</span> NFTs
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            color: '#94a3b8',
            fontSize: isMobile ? '1rem' : '1.25rem',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6
          }}
        >
          Buy, sell, and auction unique digital assets on the most advanced marketplace in the MultiversX ecosystem.
        </motion.p>

        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              marginTop: '1.5rem',
              padding: '1rem 1.5rem',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#f59e0b',
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            <span>⚡</span>
            <span>Connect your wallet to buy, sell, and create NFT listings</span>
          </motion.div>
        )}
      </div>

      {/* Mobile Sticky Filter Bar */}
      {isMobile && (
        <MobileFilterBar
          onFilterChange={handleFilterChange}
          categories={[
            { id: 'art', label: 'Art', icon: '🎨' },
            { id: 'collectibles', label: 'Collectibles', icon: '🏆' },
            { id: 'gaming', label: 'Gaming', icon: '🎮' },
            { id: 'music', label: 'Music', icon: '🎵' },
            { id: 'photography', label: 'Photo', icon: '📷' }
          ]}
        />
      )}

      {/* Main Content Layout */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: isMobile ? '1rem' : '2rem',
        display: 'flex',
        gap: isMobile ? '0' : '2rem',
        paddingBottom: isMobile ? '100px' : '2rem'
      }}>
        <FilterSidebar
          isOpen={undefined}
          onClose={() => {}}
          onFilterChange={handleFilterChange}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Toolbar */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: isMobile ? '1rem' : '1rem',
            marginBottom: '1.5rem',
            padding: isMobile ? '1rem' : '1.25rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flex: 1
            }}>
              <div style={{
                position: 'relative',
                flex: 1,
                maxWidth: isMobile ? '100%' : '400px'
              }}>
                <input
                  type="text"
                  placeholder="Search items, collections, and creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '0.75rem 1rem 0.75rem 2.5rem' : '0.875rem 1rem 0.875rem 2.75rem',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  fontSize: '1rem'
                }}>
                  🔍
                </span>
              </div>

              {!isMobile && (
                <span style={{ color: '#64748b', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                  {allListings.length} items
                </span>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
              justifyContent: isMobile ? 'space-between' : 'flex-end'
            }}>
              {isMobile && (
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  {allListings.length} items
                </span>
              )}

              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                style={{
                  padding: '0.625rem 1rem',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="recent">🕐 Recently Listed</option>
                <option value="price_asc">⬆️ Price: Low to High</option>
                <option value="price_desc">⬇️ Price: High to Low</option>
                <option value="popular">🔥 Most Popular</option>
              </select>

              <div style={{
                display: 'flex',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '10px',
                padding: '4px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: viewMode === 'grid' ? 'rgba(0, 212, 255, 0.2)' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: viewMode === 'grid' ? '#00d4ff' : '#64748b',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'all 0.2s'
                  }}
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: viewMode === 'list' ? 'rgba(0, 212, 255, 0.2)' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: viewMode === 'list' ? '#00d4ff' : '#64748b',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'all 0.2s'
                  }}
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.categories.length > 0 || filters.type !== 'all' || filters.minPrice || filters.maxPrice) && (
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginBottom: '1.5rem',
              alignItems: 'center'
            }}>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Active:</span>

              {filters.categories.map(cat => (
                <span key={cat} style={{
                  padding: '0.375rem 0.75rem',
                  background: 'rgba(0, 212, 255, 0.15)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  color: '#00d4ff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  {cat}
                  <button
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      categories: prev.categories.filter(c => c !== cat)
                    }))}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#00d4ff',
                      cursor: 'pointer',
                      padding: '0 2px',
                      fontSize: '1rem',
                      lineHeight: 1
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}

              {filters.type !== 'all' && (
                <span style={{
                  padding: '0.375rem 0.75rem',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  color: '#f59e0b'
                }}>
                  {filters.type === 'listing' ? 'Buy Now' : 'Auction'}
                </span>
              )}

              {(filters.minPrice || filters.maxPrice) && (
                <span style={{
                  padding: '0.375rem 0.75rem',
                  background: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  color: '#a855f7'
                }}>
                  {filters.minPrice || '0'} - {filters.maxPrice || '∞'} EGLD
                </span>
              )}

              <button
                onClick={() => setFilters({
                  sortBy: 'recent',
                  type: 'all',
                  minPrice: '',
                  maxPrice: '',
                  collection: '',
                  categories: []
                })}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  marginLeft: 'auto'
                }}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Content */}
          <AnimatePresence mode="wait">
            {status === 'pending' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: viewMode === 'grid'
                    ? (isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(280px, 1fr))')
                    : '1fr',
                  gap: isMobile ? '0.75rem' : '1.5rem'
                }}
              >
                {Array(8).fill(null).map((_, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    aspectRatio: viewMode === 'grid' ? 'auto' : 'auto',
                    height: viewMode === 'grid' ? 'auto' : '120px'
                  }}>
                    <div style={{
                      height: viewMode === 'grid' ? '200px' : '100%',
                      background: 'linear-gradient(90deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.5s infinite',
                      width: '100%'
                    }} />
                  </div>
                ))}
              </motion.div>
            ) : status === 'error' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  color: '#64748b'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Something went wrong</h3>
                <p>Failed to load listings. Please try again.</p>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(0, 212, 255, 0.1)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: '8px',
                    color: '#00d4ff',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Retry
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {transformedListings.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    color: '#64748b'
                  }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
                    <h3 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                      No items found
                    </h3>
                    <p style={{ fontSize: '1rem' }}>Try adjusting your filters or search query</p>
                  </div>
                ) : (
                  <>
                    {viewMode === 'grid' ? (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile
                          ? 'repeat(2, 1fr)'
                          : 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: isMobile ? '0.75rem' : '1.5rem'
                      }}>
                        {transformedListings.map((listing, index) => (
                          <motion.div
                            key={listing.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <MarketplaceCard
                              id={listing.id}
                              name={listing.name}
                              image={listing.image}
                              price={listing.price}
                              creator={listing.creator || listing.seller}
                              creatorAvatar={listing.creatorAvatar}
                              likes={listing.likes}
                              isLiked={listing.isLiked}
                              collection={listing.collection}
                              isAuction={listing.isAuction}
                              endsAt={listing.endsAt}
                              onLike={handleLike}
                              onBuy={handleBuy}
                            />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {transformedListings.map((listing, index) => (
                          <motion.div
                            key={listing.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            style={{
                              display: 'flex',
                              gap: '1.5rem',
                              padding: '1rem',
                              background: 'rgba(255,255,255,0.03)',
                              borderRadius: '16px',
                              border: '1px solid rgba(255,255,255,0.1)',
                              alignItems: 'center'
                            }}
                          >
                            <img
                              src={listing.image}
                              alt={listing.name}
                              style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '12px',
                                objectFit: 'cover',
                                flexShrink: 0
                              }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h4 style={{
                                margin: '0 0 0.5rem',
                                color: '#fff',
                                fontSize: '1.1rem'
                              }}>
                                {listing.name}
                              </h4>
                              <p style={{ margin: '0 0 0.25rem', color: '#64748b', fontSize: '0.9rem' }}>
                                {listing.collection}
                              </p>
                              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem' }}>
                                by @{listing.creator || listing.seller}
                              </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{
                                color: '#00d4ff',
                                fontWeight: 700,
                                fontSize: '1.25rem',
                                marginBottom: '0.5rem'
                              }}>
                                {listing.price} EGLD
                              </div>
                              <button
                                onClick={() => handleBuy({
                                  id: listing.id,
                                  name: listing.name,
                                  price: listing.price,
                                  currency: 'EGLD'
                                })}
                                style={{
                                  padding: '0.625rem 1.25rem',
                                  background: isAuthenticated
                                    ? 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)'
                                    : 'rgba(100,100,100,0.2)',
                                  border: 'none',
                                  borderRadius: '8px',
                                  color: isAuthenticated ? '#0f172a' : '#64748b',
                                  fontWeight: 700,
                                  cursor: isAuthenticated ? 'pointer' : 'not-allowed',
                                  fontSize: '0.9rem'
                                }}
                              >
                                {isAuthenticated ? 'Buy Now' : 'Connect'}
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    <div
                      ref={ref}
                      style={{
                        marginTop: '3rem',
                        padding: '2rem',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      {isFetchingNextPage ? (
                        <div style={{
                          width: '40px',
                          height: '40px',
                          border: '3px solid rgba(0,212,255,0.1)',
                          borderTop: '3px solid #00d4ff',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                      ) : hasNextPage ? (
                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                          Loading more items...
                        </span>
                      ) : transformedListings.length > 0 ? (
                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                          You've reached the end
                        </span>
                      ) : null}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {isMobile && <MobileBottomNav />}

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
