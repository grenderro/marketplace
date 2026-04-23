// src/pages/explore.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import MarketplaceNav from '../components/marketplace/MarketplaceNav';
import MobileFilterBar from '../components/marketplace/MobileFilterBar';
import FilterSidebar from '../components/marketplace/FilterSidebar';
import MarketplaceCard from '../components/marketplace/MarketplaceCard';
import MobileBottomNav from '../components/marketplace/MobileBottomNav';
import { fetchMarketplaceNFTs, fetchCollections, searchNFTs, NFT } from '../services/multiversxApi';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';

export default function ExplorePage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [isMobile, setIsMobile] = useState(false);
  const { ref, inView } = useInView();
  const { address } = useGetAccountInfo();

  // Fetch collections for filter
  const { data: collections = [] } = useQuery({
    queryKey: ['collections'],
    queryFn: fetchCollections,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch real NFTs from MultiversX
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['nfts', selectedCollection, priceRange, sortBy],
    queryFn: async ({ pageParam = 1 }) => {
      return fetchMarketplaceNFTs({
        collection: selectedCollection,
        priceMin: priceRange.min ? parseFloat(priceRange.min) : undefined,
        priceMax: priceRange.max ? parseFloat(priceRange.max) : undefined,
        sort: sortBy,
        page: pageParam,
        size: 20,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage.hasMore && lastPage.items.length < 20) return undefined;
      return pages.length + 1;
    },
  });

  // Infinite scroll
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const allNFTs = data?.pages.flatMap(page => page.items) || [];

  const clearFilters = () => {
    setSelectedCollection('');
    setPriceRange({ min: '', max: '' });
    setSortBy('newest');
    refetch();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <MarketplaceNav />

      {/* Filters & Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: isMobile ? '100px 1rem 2rem' : '120px 2rem 2rem',
        display: 'flex',
        gap: '2rem',
        paddingBottom: isMobile ? '100px' : '2rem'
      }}>
        {/* Sidebar Filters */}
        <div style={{ 
          width: '250px', 
          flexShrink: 0,
          display: isMobile ? 'none' : 'block'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Filters</h3>
            
            {/* Collection Filter */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                Collection
              </label>
              <select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              >
                <option value="">All Collections</option>
                {collections.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

                        {/* Price Range - VERTICAL STACK */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                Price Range (EGLD)
              </label>
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  marginBottom: '0.5rem',
                  boxSizing: 'border-box'
                }}
              />
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Sort */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            <button
              onClick={clearFilters}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Toolbar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px'
          }}>
            <span style={{ color: '#64748b' }}>
              {isFetchingNextPage ? 'Loading...' : `${allNFTs.length} items`}
            </span>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '0.5rem',
                  background: viewMode === 'grid' ? 'rgba(0,212,255,0.2)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: viewMode === 'grid' ? '#00d4ff' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                ⊞ Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '0.5rem',
                  background: viewMode === 'list' ? 'rgba(0,212,255,0.2)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: viewMode === 'list' ? '#00d4ff' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                ☰ List
              </button>
            </div>
          </div>

          {/* NFT Grid */}
          {status === 'pending' ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
              Loading NFTs...
            </div>
          ) : status === 'error' ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#ef4444' }}>
              Error loading NFTs. Please try again.
            </div>
          ) : allNFTs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
              No NFTs found. Try adjusting filters.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'grid' 
                ? 'repeat(auto-fill, minmax(280px, 1fr))' 
                : '1fr',
              gap: '1.5rem'
            }}>
              {allNFTs.map((nft, index) => (
                <motion.div
                  key={nft.identifier}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MarketplaceCard
                    id={nft.identifier}
                    name={nft.name}
                    image={nft.thumbnailUrl || nft.assets?.thumbnailUrl || nft.url}
                    price={nft.price || '0'}
                    creator={nft.creator || nft.owner}
                    collection={nft.collection}
                    onBuy={(item) => console.log('Buy:', item)}
                    onLike={(id) => console.log('Like:', id)}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Load More */}
          <div ref={ref} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            {isFetchingNextPage ? 'Loading more...' : hasNextPage ? 'Scroll for more' : 'No more items'}
          </div>
        </div>
      </div>

      {isMobile && <MobileBottomNav />}
    </div>
  );
}
