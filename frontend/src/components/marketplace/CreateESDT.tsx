// components/CreateESDT.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGetAccountInfo } from '../../hooks/sdkStubs';

type TokenType = 'fungible' | 'semi-fungible' | 'meta';

interface ESDTFormData {
  name: string;
  ticker: string;
  tokenType: TokenType;
  initialSupply: string;
  decimals: number;
  properties: {
    canMint: boolean;
    canBurn: boolean;
    canPause: boolean;
    canFreeze: boolean;
    canWipe: boolean;
    canChangeOwner: boolean;
    canUpgrade: boolean;
  };
}

export const CreateESDT: React.FC = () => {
  const { address } = useGetAccountInfo();
  const [tokenType, setTokenType] = useState<TokenType>('fungible');
  const [formData, setFormData] = useState<ESDTFormData>({
    name: '',
    ticker: '',
    tokenType: 'fungible',
    initialSupply: '1000000',
    decimals: 18,
    properties: {
      canMint: true,
      canBurn: true,
      canPause: true,
      canFreeze: false,
      canWipe: false,
      canChangeOwner: true,
      canUpgrade: true,
    },
  });

  const handleCreate = async () => {
    // Transaction logic similar to NFT collection
  };

  const tokenTypeCards = [
    {
      type: 'fungible' as TokenType,
      title: 'Fungible Token',
      description: 'Standard cryptocurrency like EGLD, USDC. Interchangeable 1:1.',
      icon: '💰',
      examples: 'Governance tokens, utility tokens, stablecoins',
    },
    {
      type: 'semi-fungible' as TokenType,
      title: 'Semi-Fungible (SFT)',
      description: 'Items with quantity. Can have multiple copies of same ID.',
      icon: '🎫',
      examples: 'Event tickets, game items, membership passes',
    },
    {
      type: 'meta' as TokenType,
      title: 'MetaESDT',
      description: 'Special tokens for DeFi. Can represent LP positions or staked assets.',
      icon: '🔷',
      examples: 'LP tokens, staking derivatives, wrapped assets',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Create ESDT Token</h2>
        <p className="text-gray-400">Deploy your own cryptocurrency on MultiversX</p>
      </div>

      {/* Token Type Selection */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {tokenTypeCards.map((card) => (
          <button
            key={card.type}
            onClick={() => {
              setTokenType(card.type);
              setFormData({ ...formData, tokenType: card.type });
            }}
            className={`p-6 rounded-2xl border-2 text-left transition-all ${
              tokenType === card.type
                ? 'border-cyan-400 bg-cyan-400/10'
                : 'border-gray-800 bg-[#12121a] hover:border-gray-700'
            }`}
          >
            <div className="text-4xl mb-4">{card.icon}</div>
            <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
            <p className="text-sm text-gray-400 mb-3">{card.description}</p>
            <p className="text-xs text-cyan-400">Examples: {card.examples}</p>
          </button>
        ))}
      </div>

      {/* Form */}
      <motion.div
        key={tokenType}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#12121a] rounded-2xl p-8 border border-gray-800"
      >
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Token Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., MyToken"
              className="w-full bg-[#1a1a25] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Token Ticker *
              <span className="text-xs text-gray-500 ml-2">(3-10 uppercase)</span>
            </label>
            <input
              type="text"
              value={formData.ticker}
              onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
              placeholder="e.g., MYTKN"
              maxLength={10}
              className="w-full bg-[#1a1a25] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none font-mono"
            />
          </div>
        </div>

        {tokenType === 'fungible' && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Initial Supply
              </label>
              <input
                type="number"
                value={formData.initialSupply}
                onChange={(e) => setFormData({ ...formData, initialSupply: e.target.value })}
                className="w-full bg-[#1a1a25] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Decimals: {formData.decimals}
              </label>
              <input
                type="range"
                min="0"
                max="18"
                value={formData.decimals}
                onChange={(e) => setFormData({ ...formData, decimals: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0 (Whole units)</span>
                <span>18 (Standard)</span>
              </div>
            </div>
          </div>
        )}

        {/* Properties */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-400 mb-4">
            Token Properties
          </label>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(formData.properties).map(([key, value]) => (
              <label key={key} className="flex items-center gap-3 p-4 bg-[#1a1a25] rounded-xl cursor-pointer hover:bg-[#252535] transition-colors">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setFormData({
                    ...formData,
                    properties: { ...formData.properties, [key]: e.target.checked }
                  })}
                  className="w-5 h-5 rounded border-gray-600 bg-[#12121a] text-cyan-500"
                />
                <div>
                  <p className="text-white font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getPropertyDescription(key)}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Cost Info */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-6 mb-6 border border-cyan-400/20">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400">Deployment Cost</p>
              <p className="text-2xl font-bold text-white">0.05 EGLD</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Network Fee</p>
              <p className="text-lg text-cyan-400">~0.001 EGLD</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleCreate}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold text-white text-lg hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-all"
        >
          Deploy {tokenType === 'fungible' ? 'Token' : tokenType === 'semi-fungible' ? 'SFT' : 'MetaESDT'}
        </button>
      </motion.div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <InfoCard
          title="What is ESDT?"
          description="MultiversX Standard Digital Tokens are native tokens with low fees and high speed."
          icon="⚡"
        />
        <InfoCard
          title="Gas Efficiency"
          description="ESDT transfers cost ~0.001 EGLD vs 21000 gas for ERC-20."
          icon="⛽"
        />
        <InfoCard
          title="Built-in Features"
          description="No smart contract needed for pausing, minting, or burning."
          icon="🛠️"
        />
      </div>
    </div>
  );
};

const getPropertyDescription = (key: string): string => {
  const descriptions: Record<string, string> = {
    canMint: 'Create more tokens later',
    canBurn: 'Destroy tokens permanently',
    canPause: 'Halt all transfers',
    canFreeze: 'Block specific wallets',
    canWipe: 'Delete frozen balances',
    canChangeOwner: 'Transfer admin rights',
    canUpgrade: 'Modify token properties',
  };
  return descriptions[key] || '';
};

const InfoCard: React.FC<{ title: string; description: string; icon: string }> = ({
  title,
  description,
  icon,
}) => (
  <div className="bg-[#12121a] rounded-xl p-6 border border-gray-800">
    <div className="text-3xl mb-3">{icon}</div>
    <h4 className="font-bold text-white mb-2">{title}</h4>
    <p className="text-sm text-gray-400">{description}</p>
  </div>
);
