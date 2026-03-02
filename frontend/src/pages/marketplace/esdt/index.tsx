// pages/marketplace/esdt/index.tsx
import React, { useState } from 'react';
import { TokenPriceChart, TokenList, SwapInterface, LiquidityPools, TrendingTokens } from '@/components/stubs';
import { TokenFilters, TokenLaunchpad } from '@/components/stubs';

export default function ESDTMarketplace() {
  const [activeTab, setActiveTab] = useState<'swap' | 'tokens' | 'liquidity' | 'launchpad'>('swap');

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
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-40 bg-[#0a0a0f]/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'swap', label: 'Swap', icon: '⚡' },
              { id: 'tokens', label: 'Tokens', icon: '📊' },
              { id: 'liquidity', label: 'Liquidity', icon: '💧' },
              { id: 'launchpad', label: 'Launchpad', icon: '🚀' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-bold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-green-400 border-green-400 bg-green-400/5'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
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
