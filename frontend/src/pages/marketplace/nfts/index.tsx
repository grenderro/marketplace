// pages/marketplace/nfts/index.tsx
import React from 'react';
import { CompetitionBanner, NFTGrid, NFTFilters, TrendingCollections, LiveAuctions } from '@/components/stubs';

export default function NFTMarketplace() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Competition Banner - NFT specific */}
      <CompetitionBanner />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent" />
        <div className="max-w-[1600px] mx-auto px-4 py-12 relative">
          <h1 className="text-5xl font-bold text-white mb-4">
            Discover & Collect <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Extraordinary NFTs</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Buy, sell, and auction unique digital assets on the most advanced NFT marketplace in the MultiversX ecosystem.
          </p>
        </div>
      </div>

      {/* Trending Collections Marquee */}
      <TrendingCollections />

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <NFTFilters />
          
          {/* NFT Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Explore NFTs</h2>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-cyan-500 text-black rounded-lg font-bold">
                  + Create Listing
                </button>
                <button className="px-4 py-2 bg-purple-500 text-white rounded-lg font-bold">
                  🔥 Auctions
                </button>
              </div>
            </div>
            <NFTGrid />
          </div>
        </div>
      </div>

      {/* Live Auctions Section */}
      <LiveAuctions />
    </div>
  );
}
