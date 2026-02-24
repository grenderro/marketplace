// components/MarketplaceNav.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Image as ImageIcon, Coins, ChevronDown } from 'lucide-react';

export const MarketplaceNav: React.FC = () => {
  const router = useRouter();
  const isNFT = router.pathname.startsWith('/marketplace/nfts');
  const isESDT = router.pathname.startsWith('/marketplace/esdt');

  return (
    <div className="bg-[#12121a] border-b border-gray-800">
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="flex items-center gap-6 h-16">
          {/* Main Logo */}
          <Link href="/" className="font-bold text-xl text-white">
            Marketplace
          </Link>

          {/* NFT Section */}
          <div className="relative group">
            <Link
              href="/marketplace/nfts"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isNFT
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <ImageIcon className="w-5 h-5" />
              NFTs
              <ChevronDown className="w-4 h-4" />
            </Link>
            
            {/* NFT Dropdown */}
            <div className="absolute top-full left-0 mt-2 w-56 bg-[#1a1a25] rounded-xl border border-gray-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="p-2">
                <NavDropdownItem href="/marketplace/nfts" icon="🔍" label="Explore NFTs" />
                <NavDropdownItem href="/marketplace/nfts/collections" icon="🎨" label="Collections" />
                <NavDropdownItem href="/marketplace/nfts/auctions" icon="⏰" label="Auctions" />
                <NavDropdownItem href="/marketplace/nfts/create" icon="✨" label="Create NFT" />
                <NavDropdownItem href="/marketplace/nfts/competition" icon="🏆" label="Competition" />
              </div>
            </div>
          </div>

          {/* ESDT Section */}
          <div className="relative group">
            <Link
              href="/marketplace/esdt"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isESDT
                  ? 'bg-green-500/20 text-green-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Coins className="w-5 h-5" />
              Tokens
              <ChevronDown className="w-4 h-4" />
            </Link>
            
            {/* ESDT Dropdown */}
            <div className="absolute top-full left-0 mt-2 w-56 bg-[#1a1a25] rounded-xl border border-gray-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="p-2">
                <NavDropdownItem href="/marketplace/esdt" icon="⚡" label="Swap Tokens" />
                <NavDropdownItem href="/marketplace/esdt/tokens" icon="📊" label="Token Explorer" />
                <NavDropdownItem href="/marketplace/esdt/liquidity" icon="💧" label="Liquidity Pools" />
                <NavDropdownItem href="/marketplace/esdt/launchpad" icon="🚀" label="Launchpad" />
                <NavDropdownItem href="/marketplace/esdt/create" icon="🔨" label="Create Token" />
              </div>
            </div>
          </div>

          {/* Shared Features */}
          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/marketplace/fiat"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-white"
            >
              💳 Buy Crypto
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const NavDropdownItem: React.FC<{ href: string; icon: string; label: string }> = ({
  href,
  icon,
  label,
}) => (
  <Link
    href={href}
    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
  >
    <span>{icon}</span>
    <span className="font-medium">{label}</span>
  </Link>
);
