// components/SmartTokenSelector.tsx
interface Token {
  identifier: string;
  name: string;
  symbol: string;
  iconUrl?: string;
  priceUsd: number;
  liquidityUsd: number;
  volume24hUsd: number;
  balance?: string;
}

// Find the interface definition and add cexBalances
interface SmartTokenSelectorProps {
  selectedToken: string;
  onSelect: (token: Token) => void;
  defaultTier?: LiquidityTier;
  cexBalances?: any[];  // ADD THIS LINE
}

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LoadingState, EmptyState, TokenList } from '../stubs';


type LiquidityTier = 'all' | 'micro' | 'low' | 'medium' | 'high' | 'institutional';

const TIER_CONFIG: Record<LiquidityTier, { label: string; description: string; color: string }> = {
  all: {
    label: 'All Tokens',
    description: 'Any token with >$10 liquidity',
    color: 'bg-gray-500',
  },
  micro: {
    label: 'Micro Cap',
    description: '$50 - $500 liquidity',
    color: 'bg-red-500',
  },
  low: {
    label: 'Low Cap',
    description: '$100 - $1k liquidity',
    color: 'bg-orange-500',
  },
  medium: {
    label: 'Mid Cap',
    description: '$1k - $10k liquidity',
    color: 'bg-yellow-500',
  },
  high: {
    label: 'High Cap',
    description: '$10k - $100k liquidity',
    color: 'bg-green-500',
  },
  institutional: {
    label: 'Institutional',
    description: '>$100k liquidity',
    color: 'bg-cyan-500',
  },
};

export const SmartTokenSelector: React.FC<{
  selectedToken: string;
  onSelect: (token: Token) => void;
  defaultTier?: LiquidityTier;
  cexBalances?: any[];
}> = ({ selectedToken, onSelect, defaultTier = 'low', cexBalances }) => {
  const [activeTier, setActiveTier] = useState<LiquidityTier>(defaultTier);
  const [showTierInfo, setShowTierInfo] = useState(false);

  const { data: tokensData, isLoading } = useQuery({
    queryKey: ['discovered-tokens', activeTier],
    queryFn: async () => {
      const res = await fetch(`/api/tokens?tier=${activeTier}`);
      return res.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const tokens = tokensData?.data || [];

  return (
    <div className="bg-[#12121a] rounded-2xl border border-gray-800 overflow-hidden">
      {/* Liquidity Tier Selector */}
      <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white">Liquidity Filter</h3>
          <button
            onClick={() => setShowTierInfo(!showTierInfo)}
            className="text-xs text-cyan-400 hover:underline"
          >
            {showTierInfo ? 'Hide Info' : 'What\'s this?'}
          </button>
        </div>

        {showTierInfo && (
          <div className="mb-3 p-3 bg-gray-800/50 rounded-lg text-sm text-gray-400">
            <p>Liquidity shows how much money is available for trading. Higher liquidity = easier to buy/sell without price impact.</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {(Object.keys(TIER_CONFIG) as LiquidityTier[]).map((tier) => (
            <button
              key={tier}
              onClick={() => setActiveTier(tier)}
              className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTier === tier
                  ? `${TIER_CONFIG[tier].color} text-white shadow-lg`
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {TIER_CONFIG[tier].label}
              {tier === activeTier && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>

        <p className="mt-2 text-xs text-gray-500">
          {TIER_CONFIG[activeTier].description} • {tokens.length} tokens available
        </p>
      </div>

      {/* Warning for low liquidity */}
      {activeTier === 'micro' && (
        <div className="p-3 bg-red-500/10 border-b border-red-500/20">
          <p className="text-sm text-red-400 flex items-center gap-2">
            <span>⚠️</span>
            <span>Warning: Micro-cap tokens have high slippage and volatility. Trade carefully.</span>
          </p>
        </div>
      )}

      {/* Token List */}
      <div className="max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <LoadingState />
        ) : tokens.length === 0 ? (
          <EmptyState tier={activeTier} />
        ) : (
          <TokenList 
            tokens={tokens} 
            selectedToken={selectedToken}
            onSelect={onSelect}
            showLiquidityIndicator={true}
          />
        )}
      </div>
    </div>
  );
};

// Enhanced token row with liquidity indicator
const TokenRow: React.FC<{
  token: Token;
  isSelected: boolean;
  onClick: () => void;
  showLiquidityIndicator?: boolean;
}> = ({ token, isSelected, onClick, showLiquidityIndicator }) => {
  const getLiquidityColor = (liquidity: number) => {
    if (liquidity >= 100000) return 'text-cyan-400';
    if (liquidity >= 10000) return 'text-green-400';
    if (liquidity >= 1000) return 'text-yellow-400';
    if (liquidity >= 100) return 'text-orange-400';
    return 'text-red-400';
  };

  const getLiquidityIcon = (liquidity: number) => {
    if (liquidity >= 100000) return '🌊';
    if (liquidity >= 10000) return '💧';
    if (liquidity >= 1000) return '💦';
    return '💧';
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 hover:bg-[#1a1a25] transition-colors border-l-2 ${
        isSelected ? 'bg-cyan-400/10 border-cyan-400' : 'border-transparent'
      }`}
    >
      {/* Token Icon */}
      <img 
        src={token.iconUrl || '/placeholder.png'} 
        alt={token.symbol}
        className="w-10 h-10 rounded-full"
      />

      {/* Token Info */}
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">{token.symbol}</span>
          <span className="text-xs text-gray-500">{token.name}</span>
        </div>
        
        {/* Price & Liquidity Row */}
        <div className="flex items-center gap-3 text-sm">
          <span className="text-cyan-400">
            ${token.priceUsd < 0.0001 ? '<0.0001' : token.priceUsd.toFixed(6)}
          </span>
          
          {showLiquidityIndicator && (
            <span className={`flex items-center gap-1 ${getLiquidityColor(token.liquidityUsd)}`}>
              <span>{getLiquidityIcon(token.liquidityUsd)}</span>
              <span>
                {token.liquidityUsd >= 1000 
                  ? `$${(token.liquidityUsd / 1000).toFixed(1)}k` 
                  : `$${token.liquidityUsd.toFixed(0)}`}
              </span>
            </span>
          )}
          
          <span className="text-gray-600">
            Vol: ${token.volume24hUsd >= 1000 
              ? `${(token.volume24hUsd / 1000).toFixed(1)}k` 
              : token.volume24hUsd.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Slippage Warning for Low Liquidity */}
      {token.liquidityUsd < 500 && (
        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
          High Slippage
        </span>
      )}

      {/* Selected Checkmark */}
      {isSelected && (
        <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
};
