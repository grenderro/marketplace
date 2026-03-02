import React from 'react';

export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-spin ${className}`}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth="4" strokeDasharray="60" strokeLinecap="round" />
    </svg>
  </div>
);

export const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center p-12">
    <div className="w-8 h-8 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
  </div>
);

export const EmptyState: React.FC<{ tier?: string }> = ({ tier }) => (
  <div className="text-center p-12 text-gray-400">
    No tokens found for tier: {tier}
  </div>
);

export const TokenList: React.FC<any> = ({ tokens, selectedToken, onSelect }) => (
  <div className="space-y-2">
    {tokens.map((token: any) => (
      <div 
        key={token.identifier}
        onClick={() => onSelect(token)}
        className={`p-3 rounded-lg cursor-pointer ${
          selectedToken === token.identifier ? 'bg-yellow-500/20 border border-yellow-500' : 'bg-gray-800'
        }`}
      >
        {token.name} ({token.identifier})
      </div>
    ))}
  </div>
);

export const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-4 gap-4">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="h-64 bg-gray-800 rounded-xl animate-pulse" />
    ))}
  </div>
);

export const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="text-center p-12">
    <p className="text-red-400 mb-4">Error loading data</p>
    <button onClick={onRetry} className="px-4 py-2 bg-yellow-500 text-black rounded-lg">
      Retry
    </button>
  </div>
);

export const ActiveFilters: React.FC<any> = ({ filters, onClear }) => (
  <div className="flex items-center gap-2 mb-4">
    <span className="text-gray-400">Active Filters:</span>
    <button onClick={onClear} className="text-yellow-500 text-sm hover:underline">
      Clear All
    </button>
  </div>
);

// Stub for missing page components
export const NFTGrid: React.FC<any> = ({ listings, onBuy }) => (
  <div className="grid grid-cols-4 gap-4">
    {listings?.map((listing: any) => (
      <div key={listing.id} className="bg-gray-800 rounded-xl p-4">
        <div className="h-40 bg-gray-700 rounded-lg mb-2" />
        <button 
          onClick={() => onBuy?.(listing)}
          className="w-full py-2 bg-yellow-500 text-black rounded-lg font-bold"
        >
          Buy
        </button>
      </div>
    ))}
  </div>
);

export const FilterSidebar: React.FC<any> = (props) => (
  <aside className="w-64 bg-[#12121a] p-4 rounded-xl border border-gray-800">
    <h3 className="font-bold text-white mb-4">Filters</h3>
  </aside>
);

export const CompetitionBanner: React.FC = () => (
  <div className="bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-500/50 rounded-xl p-6 mb-6">
    <h2 className="text-2xl font-bold text-yellow-400">Trading Competition</h2>
  </div>
);
