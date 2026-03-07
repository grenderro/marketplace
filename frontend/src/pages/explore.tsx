// pages/explore.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import {
  useSdk,
  CollectionMarquee,
  SearchBar,
  StatsBar,
  FilterSidebar,
  ActiveFilters,
  SortDropdown,
  ViewToggle,
  LoadingSkeleton,
  ErrorState,
  NFTGrid,
  Spinner
} from '../components/stubs/SdkStubs';

interface Listing {
  id: string;
  name: string;
  price: string;
  image: string;
  collection: string;
  seller: string;
}

interface Filters {
  sortBy: string;
  type: 'all' | 'listing' | 'auction';
  minPrice: string;
  maxPrice: string;
  collection: string;
}

const handleBuy = (listing: any) => {
  console.log('Buying:', listing);
  alert('Buy functionality coming soon!');
};

export default function ExplorePage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<Filters>({
    sortBy: 'recent',
    type: 'all',
    minPrice: '',
    maxPrice: '',
    collection: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const { ref, inView } = useInView();
  const { isAuthenticated } = useSdk();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['listings', filters, searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      // For now, return mock data since API might not be ready
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        data: {
          listings: Array(8).fill(null).map((_, i) => ({
            id: `item-${pageParam}-${i}`,
            name: `Awesome NFT #${(pageParam - 1) * 8 + i + 1}`,
            price: `${(0.1 + i * 0.05).toFixed(2)}`,
            image: '',
            collection: 'Cool Collection',
            seller: 'erd1...seller'
          })),
          hasMore: pageParam < 3,
          collections: []
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div style={{ 
        padding: '3rem 0', 
        textAlign: 'center',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '2rem'
      }}>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}
        >
          Discover <span className="gradient-text">Extraordinary</span> NFTs
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}
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
              color: '#f59e0b'
            }}
          >
            <span>⚠️</span>
            <span>Connect your wallet to buy, sell, and create NFT listings</span>
          </motion.div>
        )}
      </div>

      {/* Collection Marquee */}
      <div style={{ marginBottom: '2rem' }}>
        <CollectionMarquee />
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem 2rem' }}>
        {/* Search and Stats */}
        <div style={{ marginBottom: '2rem' }}>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <StatsBar />
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexDirection: 'row' }}>
          {/* Sidebar Filters - Sticky */}
          <aside className="sidebar" style={{ width: '280px', flexShrink: 0 }}>
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
            />
          </aside>

          {/* Main Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Toolbar */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem',
              padding: '1rem',
              background: 'var(--bg-card)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <ActiveFilters
                filters={filters}
                onClear={() => setFilters({
                  sortBy: 'recent',
                  type: 'all',
                  minPrice: '',
                  maxPrice: '',
                  collection: '',
                })}
              />

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {allListings.length} items
                </span>
                <SortDropdown
                  value={filters.sortBy}
                  onChange={(sortBy: string) => setFilters({ ...filters, sortBy })}
                  options={[
                    { value: 'recent', label: 'Recently Listed', icon: '🕐' },
                    { value: 'price_asc', label: 'Price: Low to High', icon: '⬆️' },
                    { value: 'price_desc', label: 'Price: High to Low', icon: '⬇️' },
                  ]}
                />
                <ViewToggle mode={viewMode} onChange={setViewMode} />
              </div>
            </div>

            {/* NFT Grid */}
            <AnimatePresence mode="wait">
              {status === 'pending' ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LoadingSkeleton />
                </motion.div>
              ) : status === 'error' ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ErrorState onRetry={() => window.location.reload()} />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <NFTGrid
                    listings={allListings}
                    viewMode={viewMode}
                    onBuy={handleBuy}
                    isAuthenticated={isAuthenticated}
                  />

                  {/* Infinite Scroll Trigger */}
                  <div 
                    ref={ref} 
                    style={{ 
                      marginTop: '2rem', 
                      textAlign: 'center', 
                      padding: '2rem',
                      borderTop: '1px solid var(--border-color)'
                    }}
                  >
                    {isFetchingNextPage ? (
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.75rem',
                        color: 'var(--accent-cyan)',
                        fontWeight: 500
                      }}>
                        <Spinner />
                        <span>Loading more amazing NFTs...</span>
                      </div>
                    ) : hasNextPage ? (
                      <span style={{ color: 'var(--text-muted)' }}>
                        Scroll for more treasures ✨
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>
                        You've reached the end! 🎉
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
