// components/stubs/SdkStubs.tsx
import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';

interface SdkContextType {
  address: string;
  isAuthenticated: boolean;
  accountBalance: string;
  login: (method: 'extension' | 'wallet' | 'ledger' | 'xportal') => Promise<void>;
  logout: () => void;
  sendTransaction: (tx: any) => Promise<any>;
}

const SdkContext = createContext<SdkContextType>({
  address: '',
  isAuthenticated: false,
  accountBalance: '0',
  login: async () => {},
  logout: () => {},
  sendTransaction: async () => ({}),
});

export const RealSdkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState(localStorage.getItem('wallet_address') || '');
  
  const login = useCallback(async (method: 'extension' | 'wallet' | 'ledger' | 'xportal') => {
    const stubAddress = 'erd1qqqqqqqqqqqqqpgqhy6nl6zq07rn7ygqg9k0tpy97y06pf7cgqqq6f4sf4';
    localStorage.setItem('wallet_address', stubAddress);
    setAddress(stubAddress);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('wallet_address');
    setAddress('');
  }, []);

  const sendTransaction = useCallback(async (tx: any) => {
    console.log('Transaction:', tx);
    return { success: true, hash: 'stub-tx-hash-' + Date.now() };
  }, []);

  return (
    <SdkContext.Provider value={{
      address,
      isAuthenticated: !!address,
      accountBalance: '1000000000000000000',
      login,
      logout,
      sendTransaction
    }}>
      {children}
    </SdkContext.Provider>
  );
};

export const useSdk = () => {
  const context = useContext(SdkContext);
  if (!context) throw new Error('useSdk must be used within RealSdkProvider');
  return context;
};

// Styled Navigation
export const MarketplaceNav: React.FC = () => {
  const currentPath = window.location.pathname;
  
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
      {/* Logo and Brand */}
      <a href="/explore" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem',
        textDecoration: 'none'
      }}>
        {/* Logo Icon */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'var(--gradient-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          boxShadow: '0 0 15px rgba(0, 212, 255, 0.4)'
        }}>
          ⚡
        </div>
        
        {/* Brand Name */}
        <span style={{ 
          fontSize: '1.5rem', 
          fontWeight: '800',
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em'
        }}>
          Trad3E
        </span>
      </a>

      {/* Navigation Links */}
      <div style={{ display: 'flex', gap: '2rem' }}>
        <a 
          href="/marketplace/nfts" 
          className={`nav-link ${currentPath.includes('/nfts') ? 'active' : ''}`}
          style={{
            color: currentPath.includes('/nfts') ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            textDecoration: 'none',
            fontWeight: currentPath.includes('/nfts') ? '600' : '500',
            fontSize: '1rem',
            padding: '0.5rem 0',
            position: 'relative',
            transition: 'all 0.3s ease'
          }}
        >
          NFTs
          {currentPath.includes('/nfts') && (
            <span style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              height: '2px',
              background: 'var(--gradient-primary)',
              boxShadow: '0 0 10px var(--accent-cyan)'
            }} />
          )}
        </a>

        <a 
          href="/marketplace/esdt" 
          className={`nav-link ${currentPath.includes('/esdt') ? 'active' : ''}`}
          style={{
            color: currentPath.includes('/esdt') ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            textDecoration: 'none',
            fontWeight: currentPath.includes('/esdt') ? '600' : '500',
            fontSize: '1rem',
            padding: '0.5rem 0',
            position: 'relative',
            transition: 'all 0.3s ease'
          }}
        >
          ESDT
          {currentPath.includes('/esdt') && (
            <span style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              height: '2px',
              background: 'var(--gradient-primary)',
              boxShadow: '0 0 10px var(--accent-cyan)'
            }} />
          )}
        </a>

        <a 
          href="/explore" 
          className={`nav-link ${currentPath === '/explore' ? 'active' : ''}`}
          style={{
            color: currentPath === '/explore' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            textDecoration: 'none',
            fontWeight: currentPath === '/explore' ? '600' : '500',
            fontSize: '1rem',
            padding: '0.5rem 0',
            position: 'relative',
            transition: 'all 0.3s ease'
          }}
        >
          Explore
          {currentPath === '/explore' && (
            <span style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              height: '2px',
              background: 'var(--gradient-primary)',
              boxShadow: '0 0 10px var(--accent-cyan)'
            }} />
          )}
        </a>
      </div>
    </nav>
  );
};
// Styled Components
export const CollectionMarquee: React.FC = () => (
  <div style={{ 
    padding: '2rem 0', 
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '2rem'
  }}>
    <h2 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
      Trending Collections
    </h2>
    <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="card" style={{ minWidth: '200px', textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'var(--gradient-primary)',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem'
          }}>
            🎨
          </div>
          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Collection {i}</div>
          <div style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>1.2K items</div>
        </div>
      ))}
    </div>
  </div>
);

export const SearchBar: React.FC<{value?: string, onChange?: (v: string) => void}> = () => (
  <div className="search-container" style={{ marginBottom: '2rem' }}>
    <span className="search-icon">🔍</span>
    <input 
      type="text" 
      placeholder="Search items, collections, and accounts..." 
      className="search-input"
    />
  </div>
);

export const StatsBar: React.FC = () => (
  <div className="stats-bar">
    <div className="stat-item">
      <span className="stat-label">Total Volume</span>
      <span className="stat-value">24.5K EGLD</span>
    </div>
    <div className="stat-item">
      <span className="stat-label">Floor Price</span>
      <span className="stat-value">0.5 EGLD</span>
    </div>
    <div className="stat-item">
      <span className="stat-label">Listed Items</span>
      <span className="stat-value">1,234</span>
    </div>
    <div className="stat-item">
      <span className="stat-label">Unique Owners</span>
      <span className="stat-value">567</span>
    </div>
  </div>
);

export const FilterSidebar: React.FC<any> = () => (
  <div className="sidebar">
    <div className="sidebar-title">Filters</div>
    
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
        Price Range
      </label>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input type="number" placeholder="Min" style={{ width: '50%', padding: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white' }} />
        <input type="number" placeholder="Max" style={{ width: '50%', padding: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white' }} />
      </div>
    </div>

    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
        Categories
      </label>
      {['Art', 'Gaming', 'Music', 'Sports'].map(cat => (
        <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
          <input type="checkbox" style={{ accentColor: 'var(--accent-cyan)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>{cat}</span>
        </label>
      ))}
    </div>

    <button className="btn-primary" style={{ width: '100%' }}>Apply Filters</button>
  </div>
);

export const ActiveFilters: React.FC<any> = () => (
  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
    <span className="filter-tag">
      Price: 0-10 EGLD <button>×</button>
    </span>
    <span className="filter-tag">
      Category: Art <button>×</button>
    </span>
  </div>
);

export const SortDropdown: React.FC<any> = ({ options }) => (
  <select className="btn-secondary" style={{ appearance: 'none', paddingRight: '2rem' }}>
    {options?.map((opt: any) => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

export const ViewToggle: React.FC<any> = () => (
  <div style={{ display: 'flex', gap: '0.5rem' }}>
    <button className="btn-secondary" style={{ padding: '0.5rem' }}>⊞</button>
    <button className="btn-secondary" style={{ padding: '0.5rem', opacity: 0.5 }}>☰</button>
  </div>
);

export const NFTGrid: React.FC<any> = ({ listings }) => (
  <div className="grid-4">
    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <div key={i} className="nft-card">
        <div className="nft-image" style={{ 
          background: 'linear-gradient(135deg, #1a2332 0%, #2a3a4f 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '4rem'
        }}>
          🎨
        </div>
        <div className="nft-info">
          <div className="nft-title">Awesome NFT #{i}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <span className="nft-price">0.{i} EGLD</span>
            <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Buy</button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const LoadingSkeleton: React.FC = () => (
  <div className="grid-4">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="card" style={{ height: '300px' }}>
        <div className="skeleton" style={{ height: '200px', marginBottom: '1rem' }} />
        <div className="skeleton" style={{ height: '20px', width: '70%', marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ height: '20px', width: '40%' }} />
      </div>
    ))}
  </div>
);

export const ErrorState: React.FC<any> = ({ onRetry }) => (
  <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
    <h3 style={{ marginBottom: '1rem' }}>Something went wrong</h3>
    <button className="btn-primary" onClick={onRetry}>Try Again</button>
  </div>
);

export const Spinner: React.FC = () => (
  <div style={{ 
    width: '20px', 
    height: '20px', 
    border: '2px solid var(--border-color)',
    borderTop: '2px solid var(--accent-cyan)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }} />
);

// Other exports remain the same...
export const TokenPriceChart: React.FC = () => <div className="card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📈 Price Chart</div>;
export const TokenList: React.FC = () => <div className="card">Token List</div>;
export const SwapInterface: React.FC = () => <div className="card">Swap Interface</div>;
export const LiquidityPools: React.FC = () => <div className="card">Liquidity Pools</div>;
export const TrendingTokens: React.FC = () => <div className="card">Trending Tokens</div>;
export const TokenFilters: React.FC = () => <div className="card">Token Filters</div>;
export const TokenLaunchpad: React.FC = () => <div className="card">Token Launchpad</div>;
export const CompetitionBanner: React.FC = () => (
  <div className="card" style={{ 
    background: 'var(--gradient-glow)', 
    marginBottom: '2rem',
    textAlign: 'center',
    padding: '2rem'
  }}>
    <h2 style={{ marginBottom: '0.5rem' }}>🏆 Trading Competition</h2>
    <p style={{ color: 'var(--text-secondary)' }}>Win up to 100 EGLD in prizes!</p>
  </div>
);
export const TrendingCollections: React.FC = () => <CollectionMarquee />;
export const NFTFilters: React.FC = () => <FilterSidebar />;
export const LiveAuctions: React.FC = () => <div className="card">Live Auctions</div>;
export const LiveAuctionsSection: React.FC = () => (
  <div style={{ marginTop: '3rem' }}>
    <h2 style={{ marginBottom: '1.5rem' }} className="gradient-text">Live Auctions</h2>
    <div className="grid-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="card">
          <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>🔨</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Auction Item #{i}</div>
            <div style={{ color: 'var(--accent-cyan)', fontSize: '1.2rem', fontWeight: '700' }}>2.{i} EGLD</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Ends in 2h 3{i}m</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Legacy exports
export const DappUI = {
  useLoginService: () => ({ login: async () => {} }),
  useLogout: () => () => {},
};
export const DappProvider: React.FC<{ children: ReactNode }> = ({ children }) => <>{children}</>;
export const useGetAccountInfo = () => ({ 
  address: localStorage.getItem('wallet_address') || '', 
  account: { balance: '0' } 
});
export const useGetLoginInfo = () => ({ isLoggedIn: !!localStorage.getItem('wallet_address') });
export const useGetNetworkConfig = () => ({ 
  network: { apiAddress: 'https://devnet-api.multiversx.com', chainId: 'D' } 
});
export const useTransaction = () => ({ sendTransaction: async () => ({}) });
export type TransactionCallbackParams = any;

const SdkStubs = {
  useScQuery: () => ({ data: null, isLoading: false }),
  useScTransaction: () => ({ trigger: async () => ({ success: true }) }),
};

export default SdkStubs;
