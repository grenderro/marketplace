import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const MarketplaceSwitcher: React.FC = () => {
  const location = useLocation();
  const isNFT = location.pathname.includes('/nfts');

  return (
    <div className="flex items-center gap-4 bg-[#12121a] p-1 rounded-lg border border-gray-800">
      <Link
        to="/marketplace/nfts"
        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
          isNFT ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
        }`}
      >
        <span>NFT Marketplace</span>
      </Link>
      <Link
        to="/marketplace/esdt"
        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
          !isNFT ? 'bg-green-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
        }`}
      >
        <span>Token Marketplace</span>
      </Link>
    </div>
  );
};
