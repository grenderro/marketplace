// pages/explore.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import { NFTGrid } from '@/components/NFTGrid';
import { FilterSidebar } from '@/components/FilterSidebar';
import { CollectionMarquee } from '@/components/CollectionMarquee';
import { SearchBar } from '@/components/SearchBar';
import { SortDropdown } from '@/components/SortDropdown';
import { ViewToggle } from '@/components/ViewToggle';
import { StatsBar } from '@/components/StatsBar';

interface Listing {
  id: string;
  source: string;
  identifier: string;
  name: string;
  imageUrl: string;
  price: string;
  priceUsd?: string;
  currency: string;
  type: 'fixed' | 'auction';
  collection: string;
  marketplaceUrl: string;
  endTime?: number;
  rarity?: number;
}

export default function ExplorePage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    sortBy: 'recent',
    type: 'all',
    minPrice: '',
    maxPrice: '',
    collection: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const { ref, inView } = useInView();

  // Infinite scroll query
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
    getNextPageParam: (lastPage, pages) => {
      return lastPage.data.hasMore ? pages.length + 1 : undefined;
    },
  });

  // Load more when scrolling
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allListings = data?.pages.flatMap(page => page.data.listings) || [];
  const collections = data?.pages[0]?.data.collections || [];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Stats */}
      <StatsBar />

      {/* Collection Marquee */}
      <CollectionMarquee collections={collections} />

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search NFTs, collections, or accounts..."
          />
          
          <div className="flex gap-3">
            <SortDropdown 
              value={filters.sortBy}
              onChange={(sortBy) => setFilters({ ...filters, sortBy })}
              options={[
                { value: 'recent', label: 'Recently Listed', icon: '🕐' },
                { value: 'price_asc', label: 'Price: Low to High', icon: '⬆️' },
                { value: 'price_desc', label: 'Price: High to Low', icon: '⬇️' },
                { value: 'rarity', label: 'Rarity Rank', icon: '💎' },
              ]}
            />
            
            <ViewToggle mode={viewMode} onChange={setViewMode} />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <FilterSidebar 
            filters={filters}
            onChange={setFilters}
            collections={collections}
          />

          {/* Results Grid */}
          <div className="flex-1">
            {/* Active Filters */}
            <ActiveFilters filters={filters} onClear={() => setFilters({
              sortBy: 'recent',
              type: 'all',
              minPrice: '',
              maxPrice: '',
              collection: '',
            })} />

            {/* Results Count */}
            <p className="text-gray-400 mb-4">
              Showing {allListings.length.toLocaleString()} NFTs for sale
            </p>

            {/* NFT Grid */}
            {status === 'loading' ? (
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
                <div ref={ref} className="py-8 text-center">
                  {isFetchingNextPage && (
                    <div className="inline-flex items-center gap-2 text-cyan-400">
                      <Spinner className="w-5 h-5 animate-spin" />
                      Loading more...
                    </div>
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

// ============== SUB-COMPONENTS ==============

const NFTGrid: React.FC<{
  listings: Listing[];
  viewMode: 'grid' | 'list';
  onBuy: (listing: Listing) => void;
}> = ({ listings, viewMode, onBuy }) => {
  if (listings.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-bold text-white mb-2">No listings found</h3>
        <p className="text-gray-400">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <motion.div 
      layout
      className={viewMode === 'grid' 
        ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
        : 'space-y-4'
      }
    >
      <AnimatePresence>
        {listings.map((listing, index) => (
          <NFTCard 
            key={listing.id}
            listing={listing}
            viewMode={viewMode}
            index={index}
            onBuy={() => onBuy(listing)}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

const NFTCard: React.FC<{
  listing: Listing;
  viewMode: 'grid' | 'list';
  index: number;
  onBuy: () => void;
}> = ({ listing, viewMode, index, onBuy }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: string) => {
    const egld = Number(price) / 1e18;
    return egld < 0.001 ? '<0.001' : egld.toFixed(3);
  };

  const sourceColors: Record<string, string> = {
    xexchange: 'bg-blue-500',
    frameit: 'bg-purple-500',
    krogan: 'bg-orange-500',
    isengard: 'bg-green-500',
    custom: 'bg-gray-500',
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex items-center gap-4 p-4 bg-[#12121a] rounded-xl border border-gray-800 hover:border-cyan-400/50 transition-colors"
      >
        <img 
          src={listing.imageUrl}
          alt={listing.name}
          className="w-20 h-20 rounded-lg object-cover"
        />
        
        <div className="flex-1">
          <h4 className="font-bold text-white">{listing.name}</h4>
          <p className="text-sm text-gray-400">{listing.collection}</p>
        </div>

        <div className="text-right">
          <p className="text-xl font-bold text-cyan-400">
            {formatPrice(listing.price)} EGLD
          </p>
          {listing.priceUsd && (
            <p className="text-sm text-gray-500">${listing.priceUsd}</p>
          )}
        </div>

        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded text-xs text-white ${sourceColors[listing.source]}`}>
            {listing.source}
          </span>
          {listing.type === 'auction' && (
            <span className="px-2 py-1 rounded text-xs bg-orange-500/20 text-orange-400">
              ⏰ Auction
            </span>
          )}
        </div>

        <button
          onClick={onBuy}
          className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-white"
        >
          Buy
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-[#12121a] rounded-xl overflow-hidden border border-gray-800 hover:border-cyan-400/50 transition-all"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse" />
        )}
        
        <img 
          src={listing.imageUrl}
          alt={listing.name}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />

        {/* Source Badge */}
        <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-bold text-white ${sourceColors[listing.source]}`}>
          {listing.source}
        </div>

        {/* Type Badge */}
        {listing.type === 'auction' && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-orange-500/90 rounded-lg text-xs font-bold text-white">
            ⏰ {listing.endTime ? formatTimeLeft(listing.endTime) : 'Auction'}
          </div>
        )}

        {/* Rarity Badge */}
        {listing.rarity && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-purple-500/90 rounded-lg text-xs font-bold text-white">
            💎 Rank #{listing.rarity}
          </div>
        )}

        {/* Hover Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2"
            >
              <button
                onClick={onBuy}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold text-white transform hover:scale-105 transition-transform"
              >
                Buy Now
              </button>
              <a
                href={listing.marketplaceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white/10 rounded-xl text-white hover:bg-white/20"
              >
                ↗️
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div className="p-4">
        <h4 className="font-bold text-white truncate mb-1">{listing.name}</h4>
        <p className="text-sm text-gray-400 truncate mb-3">{listing.collection}</p>
        
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">Price</p>
            <p className="text-xl font-bold text-cyan-400">
              {formatPrice(listing.price)}
              <span className="text-sm ml-1">EGLD</span>
            </p>
            {listing.priceUsd && (
              <p className="text-xs text-gray-500">${listing.priceUsd}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============== HELPER COMPONENTS ==============

const CollectionMarquee: React.FC<{ collections: any[] }> = ({ collections }) => (
  <div className="bg-[#12121a] border-y border-gray-800 py-4 overflow-hidden">
    <div className="flex animate-marquee whitespace-nowrap">
      {[...collections, ...collections].map((col, i) => (
        <div key={`${col.identifier}-${i}`} className="inline-flex items-center mx-6">
          <img 
            src={col.image || '/placeholder.png'} 
            alt={col.name}
            className="w-8 h-8 rounded-full mr-3"
          />
          <div>
            <p className="font-bold text-white text-sm">{col.name}</p>
            <p className="text-xs text-cyan-400">Floor: {(col.floorPrice / 1e18).toFixed(2)} EGLD</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StatsBar: React.FC = () => {
  const [stats, setStats] = useState({
    totalListings: 0,
    volume24h: '0',
    floorChanges: '+0%',
  });

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => setStats(data));
  }, []);

  return (
    <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border-b border-gray-800">
      <div className="max-w-[1600px] mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-8">
          <div>
            <p className="text-3xl font-bold text-white">{stats.totalListings.toLocaleString()}</p>
            <p className="text-sm text-gray-400">NFTs For Sale</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-cyan-400">{stats.volume24h} EGLD</p>
            <p className="text-sm text-gray-400">24h Volume</p>
          </div>
          <div>
            <p className={`text-3xl font-bold ${stats.floorChanges.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
              {stats.floorChanges}
            </p>
            <p className="text-sm text-gray-400">Floor Price (24h)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility functions
const formatTimeLeft = (timestamp: number): string => {
  const diff = timestamp - Date.now() / 1000;
  if (diff < 0) return 'Ended';
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  return `${hours}h ${minutes}m`;
};
