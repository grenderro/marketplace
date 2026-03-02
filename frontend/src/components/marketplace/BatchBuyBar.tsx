// components/BatchBuyBar.tsx
import React from 'react';
import { useGetAccountInfo } from '../../hooks/sdkStubs';

interface SelectedItem {
  id: number;
  type: 'listing' | 'auction';
  name: string;
  image: string;
  price: string;
  token: string;
}

export const BatchBuyBar: React.FC<{
  selectedItems: SelectedItem[];
  onRemove: (id: number) => void;
  onClear: () => void;
  onCheckout: () => void;
}> = ({ selectedItems, onRemove, onClear, onCheckout }) => {
  const { address } = useGetAccountInfo();
  const total = selectedItems.reduce((sum, item) => sum + parseFloat(item.price), 0);

  if (selectedItems.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <div className="bg-[#1a1a25]/95 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-4 shadow-[0_0_40px_rgba(0,212,255,0.2)]">
        <div className="flex items-center justify-between gap-4">
          {/* Selected Items Preview */}
          <div className="flex items-center gap-4 flex-1 overflow-hidden">
            <div className="flex -space-x-3">
              {selectedItems.slice(0, 5).map((item, idx) => (
                <div 
                  key={item.id}
                  className="relative w-12 h-12 rounded-lg border-2 border-[#1a1a25] overflow-hidden group"
                  style={{ zIndex: 5 - idx }}
                >
                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => onRemove(item.id)}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="text-white text-xs">×</span>
                  </button>
                </div>
              ))}
              {selectedItems.length > 5 && (
                <div className="w-12 h-12 rounded-lg bg-gray-800 border-2 border-[#1a1a25] flex items-center justify-center text-sm font-bold text-gray-400">
                  +{selectedItems.length - 5}
                </div>
              )}
            </div>
            
            <div className="hidden sm:block">
              <p className="text-white font-bold">{selectedItems.length} items selected</p>
              <p className="text-sm text-gray-400">Batch save on gas fees</p>
            </div>
          </div>

          {/* Total & Actions */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Total</p>
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                {total.toFixed(4)} EGLD
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onClear}
                className="px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
              >
                Clear
              </button>
              <button
                onClick={onCheckout}
                disabled={!address}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-bold text-white hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {address ? 'Buy All' : 'Connect Wallet'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
