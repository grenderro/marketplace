// components/MarketplaceCard.tsx
import React, { useState } from 'react';
import { useGetAccountInfo, useGetNetworkConfig } from '../../hooks/sdkStubs';
import { ContractFunction, Transaction, TransactionPayload } from '@multiversx/sdk-core';
import { formatAmount, formatDate } from '@/utils/format';

interface AssetCardProps {
  type: 'listing' | 'auction';
  id: number;
  tokenId: string;
  nonce: number;
  amount: string;
  imageUrl: string;
  name: string;
  price?: string;
  priceToken?: string;
  seller: string;
  endTime?: number;
  highestBid?: string;
  highestBidder?: string;
  onAction: () => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  type,
  id,
  tokenId,
  nonce,
  imageUrl,
  name,
  price,
  priceToken,
  seller,
  endTime,
  highestBid,
  onAction,
}) => {
  const { address } = useGetAccountInfo();
  const [bidAmount, setBidAmount] = useState('');
  const isAuction = type === 'auction';
  const isSeller = address === seller;
  const isEnded = endTime && Date.now() / 1000 > endTime;

  const gradientBorder = "before:absolute before:inset-0 before:rounded-xl before:p-[1px] before:bg-gradient-to-r before:from-cyan-400 before:via-purple-500 before:to-pink-500 before:-z-10";

  return (
    <div className={`relative group ${gradientBorder}`}>
      <div className="bg-[#1a1a25] rounded-xl overflow-hidden hover:bg-[#252535] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,212,255,0.15)]">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-2 right-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-cyan-400/30">
            <span className="text-xs font-bold text-cyan-400">
              {isAuction ? 'AUCTION' : 'FIXED PRICE'}
            </span>
          </div>
          {isEnded && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <span className="text-2xl font-bold text-pink-500">ENDED</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-white font-bold truncate">{name}</h3>
            <p className="text-sm text-gray-400">{tokenId}</p>
          </div>

          {isAuction ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Current Bid</span>
                <span className="text-cyan-400 font-bold">
                  {highestBid ? formatAmount(highestBid) : 'No bids'}
                </span>
              </div>
              {endTime && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Ends in</span>
                  <span className="text-purple-400 font-mono">
                    {formatDate(endTime)}
                  </span>
                </div>
              )}
              
              {!isSeller && !isEnded && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Bid amount"
                    className="flex-1 bg-[#12121a] border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    onClick={() => onAction()}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-bold text-white hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-shadow"
                  >
                    BID
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Price</span>
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                  {formatAmount(price || '0')} {priceToken}
                </span>
              </div>
              
              {!isSeller && (
                <button
                  onClick={() => onAction()}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-bold text-white hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  BUY NOW
                </button>
              )}
            </div>
          )}

          {isSeller && (
            <button
              onClick={() => onAction()}
              className="w-full py-2 border border-pink-500/50 text-pink-400 rounded-lg hover:bg-pink-500/10 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
