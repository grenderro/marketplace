// pages/marketplace/esdt/index.tsx
import React, { useState } from 'react';
import {
  TokenPriceChart,
  TokenList,
  SwapInterface,
  LiquidityPools,
  TrendingTokens,
  TokenFilters,
  TokenLaunchpad,
  useSdk
} from '../../../components/stubs/SdkStubs';

export default function ESDTMarketplace() {
  const [activeTab, setActiveTab] = useState<'swap' | 'tokens' | 'liquidity' | 'launchpad' | 'create'>('swap');
  const { isAuthenticated } = useSdk();

  const handleCreateESDT = () => {
    if (!isAuthenticated) {
      alert('Please connect your wallet first');
      return;
    }
    console.log('Creating new ESDT token...');
    // Navigate to create ESDT page or open modal
  };

  const tabs = [
    { id: 'swap', label: 'Swap', icon: '⚡', action: false },
    { id: 'tokens', label: 'Tokens', icon: '📊', action: false },
    { id: 'liquidity', label: 'Liquidity', icon: '💧', action: false },
    { id: 'launchpad', label: 'Launchpad', icon: '🚀', action: false },
    { id: 'create', label: 'Create ESDT', icon: '➕', action: true },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero - Different from NFT */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-transparent" />
        <div className="max-w-[1600px] mx-auto px-4 py-12 relative">
          <h1 className="text-5xl font-bold text-white mb-4">
            Trade <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-500">ESDT Tokens</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Swap, provide liquidity, and discover the next generation of MultiversX tokens. Low fees, deep liquidity.
          </p>

          {/* Wallet Connection Warning */}
          {!isAuthenticated && (
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="text-yellow-400 text-sm">
                ⚠️ Please connect your wallet to trade tokens
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons - Styled like NFT page */}
      <div className="sticky top-0 z-40 bg-[#0a0a0f]/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto px-4 py-4">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const isDisabled = tab.id === 'create' && !isAuthenticated;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'create') {
                      handleCreateESDT();
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  style={{
                    padding: '0.875rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.6 : 1,
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #00d4ff 0%, #2dd4bf 100%)',
                    color: '#000',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive && !tab.action
                      ? '0 0 0 2px white, 0 6px 20px rgba(0, 212, 255, 0.4)'
                      : '0 4px 15px rgba(0, 212, 255, 0.3)',
                    minWidth: '140px',
                    justifyContent: 'center',
                    transform: isActive && !tab.action ? 'translateY(-2px)' : 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    if (isDisabled) return;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = isActive && !tab.action
                      ? '0 0 0 2px white, 0 8px 25px rgba(0, 212, 255, 0.5)'
                      : '0 6px 20px rgba(0, 212, 255, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = isActive && !tab.action ? 'translateY(-2px)' : 'translateY(0)';
                    e.currentTarget.style.boxShadow = isActive && !tab.action
                      ? '0 0 0 2px white, 0 6px 20px rgba(0, 212, 255, 0.4)'
                      : '0 4px 15px rgba(0, 212, 255, 0.3)';
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
          
          {/* Authentication Hint for Create Button */}
          {!isAuthenticated && (
            <div style={{
              textAlign: 'center',
              marginTop: '0.75rem'
            }}>
              <p style={{
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}>
                <span>🔒</span>
                Connect wallet to create tokens
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        {activeTab === 'swap' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Swap Interface */}
            <div className="lg:col-span-1">
              <SwapInterface />
            </div>

            {/* Chart & Info */}
            <div className="lg:col-span-2 space-y-6">
              <TokenPriceChart />
              <TrendingTokens />
            </div>
          </div>
        )}

        {activeTab === 'tokens' && (
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <TokenFilters />
            </div>
            <div className="lg:col-span-3">
              <TokenList />
            </div>
          </div>
        )}

        {activeTab === 'liquidity' && (
          <LiquidityPools />
        )}

        {activeTab === 'launchpad' && (
          <TokenLaunchpad />
        )}
      </div>
    </div>
  );
}
