import React from 'react';

export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-spin border-2 border-current border-t-transparent rounded-full ${className}`} />
);

export const NFTGrid: React.FC<any> = ({ listings, onBuy, viewMode }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {listings?.map((item: any) => (
      <div key={item.id} className="bg-gray-800 rounded-lg p-4">
        <div className="h-48 bg-gray-700 rounded mb-2" />
        <button onClick={() => onBuy?.(item)} className="w-full py-2 bg-yellow-500 text-black rounded font-bold">
          Buy
        </button>
      </div>
    ))}
  </div>
);

export const FilterSidebar: React.FC<any> = () => (
  <div className="w-64 bg-[#12121a] p-4 rounded-xl border border-gray-800">
    <h3 className="font-bold text-white mb-4">Filters</h3>
    <div className="space-y-2">
      <div className="text-gray-400">Price Range</div>
      <div className="text-gray-400">Collections</div>
      <div className="text-gray-400">Status</div>
    </div>
  </div>
);

export const CompetitionBanner: React.FC = () => (
  <div className="bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-500/50 rounded-xl p-6 mb-6">
    <h2 className="text-2xl font-bold text-yellow-400">🏆 Trading Competition Active</h2>
    <p className="text-gray-300 mt-2">Win exclusive NFTs and EGLD prizes!</p>
  </div>
);

export const TokenList: React.FC<any> = () => <div className="text-gray-400">Token List Placeholder</div>;
export const TokenPriceChart: React.FC = () => <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">Price Chart</div>;
export const SwapInterface: React.FC = () => <div className="p-6 bg-[#12121a] rounded-xl border border-gray-800">Swap Interface</div>;
export const LiquidityPools: React.FC = () => <div>Liquidity Pools</div>;
export const TrendingTokens: React.FC = () => <div>Trending Tokens</div>;
export const NFTFilters: React.FC<any> = () => <div>NFT Filters</div>;
export const TrendingCollections: React.FC = () => <div>Trending Collections</div>;
export const LiveAuctions: React.FC = () => <div>Live Auctions</div>;
export const SearchBar: React.FC<any> = () => (
  <input type="text" placeholder="Search..." className="w-full p-3 bg-[#0a0a0f] border border-gray-700 rounded-lg text-white" />
);
export const SortDropdown: React.FC<any> = ({ value, onChange, options }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-[#0a0a0f] border border-gray-700 rounded-lg px-4 py-2 text-white">
    {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
  </select>
);
export const ViewToggle: React.FC<any> = () => <div>View Toggle</div>;
export const StatsBar: React.FC = () => <div className="flex gap-8 p-4 bg-[#12121a] rounded-xl"><div>Volume: 1.2M</div><div>Items: 450</div></div>;
export const CollectionMarquee: React.FC = () => <div className="flex gap-4 overflow-hidden">Collections...</div>;
export const ActiveFilters: React.FC<any> = ({ onClear }) => (
  <div className="flex items-center gap-2 mb-4">
    <span className="text-gray-400">Filters Active</span>
    <button onClick={onClear} className="text-yellow-500 text-sm">Clear All</button>
  </div>
);
export const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-4 gap-4">
    {[...Array(8)].map((_, i) => <div key={i} className="h-64 bg-gray-800 rounded-xl animate-pulse" />)}
  </div>
);
export const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="text-center p-12">
    <p className="text-red-400 mb-4">Error loading data</p>
    <button onClick={onRetry} className="px-6 py-2 bg-yellow-500 text-black rounded-lg font-bold">Retry</button>
  </div>
);

export const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center p-12">
    <div className="w-8 h-8 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
  </div>
);

export const EmptyState: React.FC<{ tier?: string }> = ({ tier }) => (
  <div className="text-center p-12 text-gray-400">
    <p>No tokens found {tier && `for tier: ${tier}`}</p>
  </div>
);

export const TokenRow: React.FC<any> = ({ token, isSelected, onClick }) => (
  <div 
    onClick={onClick}
    className={`p-3 rounded-lg cursor-pointer ${isSelected ? 'bg-yellow-500/20 border border-yellow-500' : 'bg-gray-800 hover:bg-gray-700'}`}
  >
    {token?.name || 'Token'}
  </div>
);

// UPDATED SmartTokenSelector with cexBalances prop
export const SmartTokenSelector: React.FC<{
  selectedToken: string;
  onSelect: (token: any) => void;
  defaultTier?: string;
  cexBalances?: any[];
}> = ({ selectedToken, onSelect, defaultTier = 'low', cexBalances }) => (
  <div className="p-4 bg-[#12121a] rounded-xl border border-gray-800">
    <div className="text-gray-400 mb-2">Select Token (Tier: {defaultTier})</div>
    {cexBalances && cexBalances.length > 0 && (
      <div className="text-sm text-green-400 mb-2">CEX Balance: {cexBalances.length} tokens</div>
    )}
    <div className="space-y-2">
      {['EGLD', 'MEX', 'USDC'].map((token) => (
        <div 
          key={token}
          onClick={() => onSelect({ identifier: token, name: token })}
          className={`p-3 rounded-lg cursor-pointer ${selectedToken === token ? 'bg-yellow-500/20 border border-yellow-500' : 'bg-gray-800'}`}
        >
          {token}
        </div>
      ))}
    </div>
  </div>
);

export const LeaderboardPreview: React.FC<{ competitionId: number }> = () => (
  <div className="text-sm text-gray-400">Top traders: #1 User1, #2 User2, #3 User3</div>
);

export const PortfolioAnalytics: React.FC<{ address: string }> = ({ address }) => (
  <div className="bg-[#12121a] p-6 rounded-xl border border-gray-800">
    <h3 className="text-xl font-bold mb-4">Portfolio</h3>
    <p className="text-gray-400 font-mono">{address.slice(0, 10)}...{address.slice(-4)}</p>
    <div className="mt-4 text-2xl font-bold text-yellow-400">12.5 EGLD</div>
  </div>
);

export const TokenFilters: React.FC = () => <div className="bg-[#12121a] p-4 rounded-xl border border-gray-800">Token Filters</div>;
export const TokenLaunchpad: React.FC = () => <div className="p-8 text-center">Token Launchpad Coming Soon</div>;
export const Leaderboard: React.FC = () => <div>Leaderboard Component</div>;
export const DutchAuctionCard: React.FC<any> = () => <div>Dutch Auction</div>;

// Motion wrapper for framer-motion
export const motion = {
  div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
};
