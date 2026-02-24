// components/RoyaltyManager.tsx
import React, { useState } from 'react';
import { Address } from '@multiversx/sdk-core';

interface Collection {
  id: string;
  name: string;
  ticker: string;
  items: number;
  volume: string;
  currentRoyalty: number;
  owner: string;
}

export const RoyaltyManager: React.FC<{
  collections: Collection[];
  onSetRoyalty: (collectionId: string, creator: string, percent: number) => void;
}> = ({ collections, onSetRoyalty }) => {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [creatorAddress, setCreatorAddress] = useState('');
  const [royaltyPercent, setRoyaltyPercent] = useState('2.5');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCollection) {
      onSetRoyalty(
        selectedCollection,
        creatorAddress,
        parseFloat(royaltyPercent) * 100 // Convert to basis points
      );
    }
  };

  return (
    <div className="bg-[#12121a] rounded-2xl border border-gray-800 p-6">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-pink-500">♛</span> Royalty Management
      </h3>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Collections List */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => {
                setSelectedCollection(col.id);
                setCreatorAddress(col.owner);
                setRoyaltyPercent((col.currentRoyalty / 100).toString());
              }}
              className={`w-full p-4 rounded-xl border text-left transition-all ${
                selectedCollection === col.id
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : 'border-gray-800 hover:border-gray-700 bg-[#1a1a25]'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white">{col.name}</h4>
                  <p className="text-sm text-gray-400">{col.ticker}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-cyan-400">{col.currentRoyalty / 100}%</p>
                  <p className="text-xs text-gray-500">Current Royalty</p>
                </div>
              </div>
              <div className="flex gap-4 mt-2 text-sm text-gray-400">
                <span>{col.items} items</span>
                <span>Vol: {col.volume} EGLD</span>
              </div>
            </button>
          ))}
        </div>

        {/* Configuration Form */}
        <div className="bg-[#1a1a25] rounded-xl p-6 border border-gray-800">
          {selectedCollection ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Selected Collection
                </label>
                <p className="text-white font-bold">
                  {collections.find(c => c.id === selectedCollection)?.name}
                </p>
                <p className="text-xs text-gray-500 font-mono">{selectedCollection}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Creator/Royalty Receiver Address
                </label>
                <input
                  type="text"
                  value={creatorAddress}
                  onChange={(e) => setCreatorAddress(e.target.value)}
                  placeholder="erd1..."
                  className="w-full bg-[#12121a] border border-gray-700 rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This address will receive royalty payments on every sale
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Royalty Percentage: <span className="text-cyan-400">{royaltyPercent}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={royaltyPercent}
                  onChange={(e) => setRoyaltyPercent(e.target.value)}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>5%</span>
                  <span>10%</span>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-400">
                  ⚠️ Once set, royalties are enforced on all marketplace sales. 
                  This cannot be changed without deploying a new contract.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-bold text-white hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all"
              >
                Set Royalty Configuration
              </button>
            </form>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">👆</div>
                <p>Select a collection to configure royalties</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
