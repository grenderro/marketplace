// components/DutchAuctionCard.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface DutchAuctionProps {
  auctionId: number;
  startPrice: string;
  endPrice: string;
  startTime: number;
  endTime: number;
  priceDropInterval: number;
  currentPrice: string;
  onBuy: () => void;
}

export const DutchAuctionCard: React.FC<DutchAuctionProps> = ({
  startPrice,
  endPrice,
  startTime,
  endTime,
  priceDropInterval,
  currentPrice,
  onBuy,
}) => {
  const [timeUntilDrop, setTimeUntilDrop] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now() / 1000;
      const elapsed = now - startTime;
      const total = endTime - startTime;
      const nextDrop = Math.ceil(elapsed / priceDropInterval) * priceDropInterval;
      const remaining = nextDrop - elapsed;
      
      setTimeUntilDrop(Math.max(0, remaining));
      setProgress(((now - startTime) / (endTime - startTime)) * 100);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime, priceDropInterval]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative bg-gradient-to-br from-[#1a1a25] to-[#12121a] rounded-2xl p-6 border border-orange-500/30 overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-pink-500/5"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📉</span>
          <h3 className="text-lg font-bold text-white">Dutch Auction</h3>
          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
            Price Decreasing
          </span>
        </div>

        {/* Price Display */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Current Price</p>
            <motion.p
              key={currentPrice}
              initial={{ scale: 1.2, color: '#ff0080' }}
              animate={{ scale: 1, color: '#00ffa3' }}
              className="text-4xl font-bold"
            >
              {currentPrice} EGLD
            </motion.p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Floor Price</p>
            <p className="text-xl font-bold text-gray-500">{endPrice}</p>
          </div>
        </div>

        {/* Price Drop Timer */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-orange-400">Next price drop in</span>
            <span className="font-mono font-bold text-white">
              {formatTime(timeUntilDrop)}
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
              initial={{ width: '100%' }}
              animate={{ width: `${100 - (timeUntilDrop / priceDropInterval) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Auction Progress</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="h-1 bg-gray-800 rounded-full">
            <div 
              className="h-full bg-gray-600 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Buy Button */}
        <button
          onClick={onBuy}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl font-bold text-white text-lg hover:shadow-[0_0_30px_rgba(255,159,28,0.4)] transition-all active:scale-[0.98]"
        >
          Buy Now at {currentPrice} EGLD
        </button>

        <p className="text-center text-xs text-gray-500 mt-3">
          Price decreases automatically. Don't wait too long!
        </p>
      </div>
    </div>
  );
};
