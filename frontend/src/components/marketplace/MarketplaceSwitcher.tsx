// components/MarketplaceSwitcher.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export const MarketplaceSwitcher: React.FC = () => {
  const router = useRouter();
  const isNFT = router.pathname.startsWith('/marketplace/nfts');

  return (
    <div className="flex bg-[#1a1a25] rounded-xl p-1 border border-gray-800">
      <Link
        href="/marketplace/nfts"
        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
          isNFT
            ? 'bg-purple-500 text-white shadow-lg'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        🎨 NFTs
      </Link>
      <Link
        href="/marketplace/esdt"
        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
          !isNFT
            ? 'bg-green-500 text-white shadow-lg'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        💰 Tokens
      </Link>
    </div>
  );
};
