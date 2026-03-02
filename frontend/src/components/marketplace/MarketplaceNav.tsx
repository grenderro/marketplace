import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Image as ImageIcon, Coins, ChevronDown } from 'lucide-react';

export const MarketplaceNav: React.FC = () => {
  const location = useLocation();
  const isNFT = location.pathname.includes('/nfts');
  const isESDT = location.pathname.includes('/esdt');

  const NavDropdownItem = ({ href, icon, label }: { href: string; icon: string; label: string }) => (
    <Link to={href} className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );

  return (
    <nav className="flex items-center gap-6">
      {/* NFT Dropdown */}
      <div className="relative group">
        <Link
          to="/marketplace/nfts"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isNFT ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <ImageIcon size={20} />
          <span>NFTs</span>
          <ChevronDown size={16} className="opacity-50" />
        </Link>
        <div className="absolute top-full left-0 mt-2 w-56 bg-[#1a1a25] rounded-xl border border-gray-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
          <div className="p-2">
            <NavDropdownItem href="/marketplace/nfts" icon="🔍" label="Explore NFTs" />
            <NavDropdownItem href="/marketplace/nfts/collections" icon="🎨" label="Collections" />
          </div>
        </div>
      </div>

      {/* ESDT Dropdown */}
      <div className="relative group">
        <Link
          to="/marketplace/esdt"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isESDT ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Coins size={20} />
          <span>Tokens</span>
          <ChevronDown size={16} className="opacity-50" />
        </Link>
        <div className="absolute top-full left-0 mt-2 w-56 bg-[#1a1a25] rounded-xl border border-gray-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
          <div className="p-2">
            <NavDropdownItem href="/marketplace/esdt" icon="⚡" label="Swap Tokens" />
            <NavDropdownItem href="/marketplace/esdt/tokens" icon="📊" label="Token Explorer" />
          </div>
        </div>
      </div>
    </nav>
  );
};
