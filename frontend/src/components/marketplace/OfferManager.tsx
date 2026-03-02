// components/OfferManager.tsx
import React, { useState } from 'react';
import { useGetAccountInfo } from '../../hooks/sdkStubs';

interface Offer {
  id: number;
  type: 'sent' | 'received';
  tokenWanted: { id: string; nonce: number; name: string; image: string };
  amount: string;
  price: string;
  priceToken: string;
  from: string;
  expiry: number;
  status: 'active' | 'countered' | 'accepted' | 'expired';
  counterPrice?: string;
}

export const OfferManager: React.FC<{
  offers: Offer[];
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onCounter: (id: number, price: string) => void;
  onCancel: (id: number) => void;
}> = ({ offers, onAccept, onReject, onCounter, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('received');
  const [counteringId, setCounteringId] = useState<number | null>(null);
  const [counterPrice, setCounterPrice] = useState('');

  const filteredOffers = offers.filter(o => o.type === activeTab);

  return (
    <div className="bg-[#12121a] rounded-2xl border border-gray-800 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 py-4 text-center font-bold transition-all ${
            activeTab === 'received' 
              ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Received ({offers.filter(o => o.type === 'received').length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`flex-1 py-4 text-center font-bold transition-all ${
            activeTab === 'sent' 
              ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-400/5' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Sent ({offers.filter(o => o.type === 'sent').length})
        </button>
      </div>

      {/* Offers List */}
      <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
        {filteredOffers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-4xl mb-4">📭</div>
            <p>No {activeTab} offers</p>
          </div>
        ) : (
          filteredOffers.map((offer) => (
            <div key={offer.id} className="p-6 hover:bg-[#1a1a25] transition-colors">
              <div className="flex gap-4">
                <img 
                  src={offer.tokenWanted.image} 
                  alt=""
                  className="w-20 h-20 rounded-lg object-cover"
                />
                
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-bold">{offer.tokenWanted.name}</h4>
                      <p className="text-sm text-gray-400">{offer.tokenWanted.id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      offer.status === 'active' ? 'bg-cyan-400/20 text-cyan-400' :
                      offer.status === 'countered' ? 'bg-purple-400/20 text-purple-400' :
                      offer.status === 'accepted' ? 'bg-green-400/20 text-green-400' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {offer.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-400">Offered Price</p>
                      <p className="text-xl font-bold text-white">{offer.price} {offer.priceToken}</p>
                      {offer.counterPrice && (
                        <p className="text-sm text-purple-400">Counter: {offer.counterPrice}</p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-400">From</p>
                      <p className="text-sm text-cyan-400 font-mono">
                        {offer.from.slice(0, 6)}...{offer.from.slice(-4)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Expires: {new Date(offer.expiry * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {activeTab === 'received' && offer.status === 'active' && (
                      <>
                        <button
                          onClick={() => onAccept(offer.id)}
                          className="flex-1 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-all font-bold"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => setCounteringId(offer.id)}
                          className="flex-1 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all font-bold"
                        >
                          Counter
                        </button>
                        <button
                          onClick={() => onReject(offer.id)}
                          className="px-4 py-2 border border-gray-700 text-gray-400 rounded-lg hover:border-red-500 hover:text-red-400 transition-all"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    {activeTab === 'sent' && offer.status === 'active' && (
                      <button
                        onClick={() => onCancel(offer.id)}
                        className="w-full py-2 border border-gray-700 text-gray-400 rounded-lg hover:border-red-500 hover:text-red-400 transition-all"
                      >
                        Cancel Offer
                      </button>
                    )}

                    {offer.status === 'countered' && activeTab === 'sent' && (
                      <button
                        onClick={() => onAccept(offer.id)}
                        className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-bold"
                      >
                        Accept Counter
                      </button>
                    )}
                  </div>

                  {/* Counter Input */}
                  {counteringId === offer.id && (
                    <div className="flex gap-2 pt-2 animate-in slide-in-from-top-2">
                      <input
                        type="number"
                        value={counterPrice}
                        onChange={(e) => setCounterPrice(e.target.value)}
                        placeholder="Counter price"
                        className="flex-1 bg-[#12121a] border border-purple-500/50 rounded-lg px-3 py-2 text-white"
                      />
                      <button
                        onClick={() => {
                          onCounter(offer.id, counterPrice);
                          setCounteringId(null);
                          setCounterPrice('');
                        }}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg font-bold"
                      >
                        Send
                      </button>
                      <button
                        onClick={() => setCounteringId(null)}
                        className="px-4 py-2 border border-gray-700 text-gray-400 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
