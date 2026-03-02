// components/MarketplaceFilters.tsx
import React, { useState, useCallback } from 'react';
import { useGetNetworkConfig } from '../../hooks/sdkStubs';

interface Filters {
  type: 'all' | 'listing' | 'auction' | 'offer';
  status: 'all' | 'active' | 'ending_soon' | 'new';
  priceMin: string;
  priceMax: string;
  collections: string[];
  sortBy: 'recent' | 'price_low' | 'price_high' | 'ending_soon' | 'most_bids';
  sellerVerified: boolean;
  attributes: Record<string, string[]>;
}

export const MarketplaceFilters: React.FC<{
  onFilterChange: (filters: Filters) => void;
  collections: string[];
}> = ({ onFilterChange, collections }) => {
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    status: 'all',
    priceMin: '',
    priceMax: '',
    collections: [],
    sortBy: 'recent',
    sellerVerified: false,
    attributes: {},
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  return (
    <div className="bg-[#12121a] rounded-2xl p-6 border border-gray-800 sticky top-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Filters
        </h3>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden text-cyan-400"
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      <div className={`space-y-6 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Sale Type */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Sale Type</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'all', label: 'All Items', icon: '🔥' },
              { key: 'listing', label: 'Fixed Price', icon: '🏷️' },
              { key: 'auction', label: 'Auction', icon: '⏰' },
              { key: 'offer', label: 'Has Offers', icon: '💰' },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => updateFilter('type', key as any)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filters.type === key 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 text-cyan-400' 
                    : 'bg-[#1a1a25] text-gray-400 hover:text-white'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Price Range</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceMin}
                onChange={(e) => updateFilter('priceMin', e.target.value)}
                className="w-full bg-[#1a1a25] border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none text-sm"
              />
              <span className="absolute right-3 top-2 text-gray-500 text-sm">EGLD</span>
            </div>
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="Max"
                value={filters.priceMax}
                onChange={(e) => updateFilter('priceMax', e.target.value)}
                className="w-full bg-[#1a1a25] border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none text-sm"
              />
              <span className="absolute right-3 top-2 text-gray-500 text-sm">EGLD</span>
            </div>
          </div>
        </div>

        {/* Collections */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Collections</label>
          <div className="max-h-40 overflow-y-auto space-y-2 custom-scrollbar">
            {collections.map((collection) => (
              <label key={collection} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters.collections.includes(collection)}
                    onChange={(e) => {
                      const newCollections = e.target.checked
                        ? [...filters.collections, collection]
                        : filters.collections.filter(c => c !== collection);
                      updateFilter('collections', newCollections);
                    }}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-gray-600 rounded bg-[#1a1a25] peer-checked:bg-cyan-500 peer-checked:border-cyan-500 transition-all" />
                  <svg className="absolute inset-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">
                  {collection}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value as any)}
            className="w-full bg-[#1a1a25] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
          >
            <option value="recent">Recently Listed</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="ending_soon">Ending Soon</option>
            <option value="most_bids">Most Bids</option>
          </select>
        </div>

        {/* Verified Only */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={filters.sellerVerified}
              onChange={(e) => updateFilter('sellerVerified', e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-10 h-6 bg-gray-700 rounded-full peer-checked:bg-cyan-500 transition-colors" />
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
          </div>
          <span className="text-sm text-gray-300">Verified Sellers Only</span>
        </label>

        {/* Reset */}
        <button
          onClick={() => {
            const reset: Filters = {
  type: 'all',
  status: 'all',
  priceMin: '',
  priceMax: '',
  collections: [],
  sortBy: 'recent',
  sellerVerified: false,
  attributes: {},
};
setFilters(reset);
onFilterChange(reset);
          }}
          className="w-full py-2 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-all text-sm"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};
