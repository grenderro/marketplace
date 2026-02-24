// components/FilterSidebar.tsx
import React from 'react';

interface FilterSidebarProps {
  filters: any;
  onChange: (filters: any) => void;
  collections: any[];
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChange,
  collections,
}) => {
  const priceRanges = [
    { label: 'Under 0.1 EGLD', min: '0', max: '100000000000000000' },
    { label: '0.1 - 0.5 EGLD', min: '100000000000000000', max: '500000000000000000' },
    { label: '0.5 - 1 EGLD', min: '500000000000000000', max: '1000000000000000000' },
    { label: '1 - 5 EGLD', min: '1000000000000000000', max: '5000000000000000000' },
    { label: '5+ EGLD', min: '5000000000000000000', max: '' },
  ];

  return (
    <div className="w-64 flex-shrink-0 space-y-6">
      {/* Sale Type */}
      <div className="bg-[#12121a] rounded-xl p-4 border border-gray-800">
        <h4 className="font-bold text-white mb-3">Sale Type</h4>
        <div className="space-y-2">
          {[
            { value: 'all', label: 'All Types' },
            { value: 'fixed', label: '🔥 Buy Now' },
            { value: 'auction', label: '⏰ Auction' },
          ].map((type) => (
            <label key={type.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                checked={filters.type === type.value}
                onChange={() => onChange({ ...filters, type: type.value })}
                className="w-4 h-4 text-cyan-500 bg-gray-800 border-gray-600"
              />
              <span className="text-gray-300 text-sm">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="bg-[#12121a] rounded-xl p-4 border border-gray-800">
        <h4 className="font-bold text-white mb-3">Price Range</h4>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <button
              key={range.label}
              onClick={() => onChange({
                ...filters,
                minPrice: range.min,
                maxPrice: range.max,
              })}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.minPrice === range.min && filters.maxPrice === range.max
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
        
        {/* Custom Range */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
              className="w-full bg-gray-800 rounded px-2 py-1 text-white text-sm"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
              className="w-full bg-gray-800 rounded px-2 py-1 text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Collections */}
      <div className="bg-[#12121a] rounded-xl p-4 border border-gray-800">
        <h4 className="font-bold text-white mb-3">Collections</h4>
        <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
          {collections.map((col) => (
            <button
              key={col.identifier}
              onClick={() => onChange({
                ...filters,
                collection: filters.collection === col.identifier ? '' : col.identifier,
              })}
              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                filters.collection === col.identifier
                  ? 'bg-cyan-500/20 border border-cyan-500/50'
                  : 'hover:bg-gray-800'
              }`}
            >
              <img 
                src={col.image || '/placeholder.png'} 
                alt=""
                className="w-8 h-8 rounded-full"
              />
              <div className="text-left">
                <p className="text-sm text-white font-medium truncate">{col.name}</p>
                <p className="text-xs text-gray-500">{(col.floorPrice / 1e18).toFixed(2)} EGLD</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
