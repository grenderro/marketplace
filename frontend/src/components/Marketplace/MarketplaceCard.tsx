import React from 'react';

interface Props {
  id: string;
  name: string;
  image: string;
  price: string;
  onBuy: () => void;
}

export const MarketplaceCard: React.FC<Props> = ({ name, image, price, onBuy }) => (
  <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
    <img src={image} alt={name} className="w-full aspect-square object-cover" />
    <div className="p-4">
      <h3 className="text-white font-bold mb-2">{name}</h3>
      <div className="flex justify-between items-center">
        <span className="text-cyan-400 font-bold">{price} EGLD</span>
        <button onClick={onBuy} className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm">
          Buy
        </button>
      </div>
    </div>
  </div>
);
