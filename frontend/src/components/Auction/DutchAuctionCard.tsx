import React, { useEffect, useState } from 'react';

interface Props {
  startPrice: number;
  endPrice: number;
  duration: number;
  onBuy: () => void;
}

export const DutchAuctionCard: React.FC<Props> = ({ startPrice, endPrice, duration, onBuy }) => {
  const [currentPrice, setCurrentPrice] = useState(startPrice);
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const newPrice = startPrice - (startPrice - endPrice) * progress;
      setCurrentPrice(newPrice);
      setTimeLeft(Math.max(0, duration - elapsed));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const startTime = Date.now();

  return (
    <div className="bg-gradient-to-br from-orange-900 to-red-900 p-6 rounded-2xl text-white">
      <div className="flex justify-between items-center mb-4">
        <span className="text-2xl">📉</span>
        <span className="bg-orange-500 px-2 py-1 rounded text-xs">Dutch Auction</span>
      </div>
      <div className="text-4xl font-bold mb-2">{currentPrice.toFixed(2)} EGLD</div>
      <div className="text-sm text-gray-300 mb-4">Floor: {endPrice} EGLD</div>
      <div className="text-sm mb-4">Ends in: {Math.ceil(timeLeft / 1000)}s</div>
      <button onClick={onBuy} className="w-full bg-orange-500 hover:bg-orange-600 py-3 rounded-xl font-bold">
        Buy Now
      </button>
    </div>
  );
};
