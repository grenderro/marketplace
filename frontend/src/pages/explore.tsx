// pages/explore.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { 
  NFTGrid, 
  FilterSidebar, 
  CollectionMarquee, 
  SearchBar, 
  SortDropdown, 
  ViewToggle, 
  StatsBar, 
  ActiveFilters, 
  LoadingSkeleton, 
  ErrorState, 
  Spinner 
} from '@/components/stubs';

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

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['listings', filters, searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: '24',
        sortBy: filters.sortBy,
        ...(filters.collection && { collection: filters.collection }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(searchQuery && { search: searchQuery }),
      });

      const res = await fetch(`/api/listings?${params}`);
      return res.json();
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
  const collections = data?.pages[0]?.data?.collections || [];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Collection Marquee */}
      <CollectionMarquee />

      <div className="container mx-auto px-4 py-8">
        {/* Search and Stats */}
        <div className="mb-8 space-y-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <StatsBar />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <FilterSidebar 
              filters={filters} 
              onChange={setFilters}
            />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
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
              
              <div className="flex items-center gap-4">
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
            {status === 'pending' ? (
              <LoadingSkeleton />
            ) : status === 'error' ? (
              <ErrorState onRetry={() => window.location.reload()} />
            ) : (
              <>
                <NFTGrid 
                  listings={allListings}
                  viewMode={viewMode}
                  onBuy={handleBuy}
                />
                
                {/* Infinite Scroll Trigger */}
                <div ref={ref} className="mt-8 text-center py-4">
                  {isFetchingNextPage ? (
                    <div className="inline-flex items-center gap-2 text-cyan-400">
                      <Spinner className="w-5 h-5 animate-spin" />
                      Loading more...
                    </div>
                  ) : hasNextPage ? (
                    <span className="text-gray-500">Scroll for more</span>
                  ) : (
                    <span className="text-gray-600">No more items</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
