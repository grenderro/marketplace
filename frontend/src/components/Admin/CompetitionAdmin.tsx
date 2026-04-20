// components/CompetitionAdmin.tsx
import React, { useState } from 'react';
import { Plus, Trash2, Save, Trophy } from 'lucide-react';

interface PrizeInput {
  rank: number;
  type: 'egld' | 'esdt' | 'nft' | 'custom';
  amount: string;
  token?: string;
  description: string;
}

export const CompetitionAdmin: React.FC = () => {
  const [prizes, setPrizes] = useState<PrizeInput[]>([
    { rank: 1, type: 'egld', amount: '100', description: '1st Place - 100 EGLD' },
    { rank: 2, type: 'egld', amount: '50', description: '2nd Place - 50 EGLD' },
    { rank: 3, type: 'egld', amount: '25', description: '3rd Place - 25 EGLD' },
  ]);
  const [name, setName] = useState('30-Day Trading Championship');
  const [duration, setDuration] = useState(30);
  const [scoringType, setScoringType] = useState('volume');

  const addPrize = () => {
    const nextRank = prizes.length + 1;
    setPrizes([...prizes, {
      rank: nextRank,
      type: 'egld',
      amount: '10',
      description: `${nextRank}${getOrdinal(nextRank)} Place`,
    }]);
  };

  const removePrize = (index: number) => {
    setPrizes(prizes.filter((_, i) => i !== index).map((p, i) => ({ ...p, rank: i + 1 })));
  };

  const updatePrize = (index: number, field: keyof PrizeInput, value: string) => {
    const updated = [...prizes];
    updated[index] = { ...updated[index], [field]: value };
    setPrizes(updated);
  };

  const createCompetition = async () => {
    const response = await Promise.resolve({ ok: true, json: async () => ({}) }) as any; // backendless: disabled
    /*
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        durationDays: duration,
        scoringType,
        prizes: prizes.map(p => ({
          rank: p.rank,
          type: p.type === 'egld' ? 0 : p.type === 'esdt' ? 1 : p.type === 'nft' ? 2 : 3,
          amount: p.amount,
          token: p.token,
          description: p.description,
        })),
      }),
    });
    */

    if (response.ok) {
      alert('Competition created successfully!');
    }
  };

  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  return (
    <div className="max-w-4xl mx-auto bg-[#12121a] rounded-2xl border border-gray-800 p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-400" />
        Create Competition
      </h2>

      <div className="space-y-6">
        {/* Basic Settings */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Competition Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1a1a25] border border-gray-700 rounded-lg px-4 py-3 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Duration (Days)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              min={1}
              max={30}
              className="w-full bg-[#1a1a25] border border-gray-700 rounded-lg px-4 py-3 text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Scoring Type</label>
          <select
            value={scoringType}
            onChange={(e) => setScoringType(e.target.value)}
            className="w-full bg-[#1a1a25] border border-gray-700 rounded-lg px-4 py-3 text-white"
          >
            <option value="volume">Total Volume (Buy + Sell)</option>
            <option value="buys">Buy Volume Only</option>
            <option value="sells">Sell Volume Only</option>
            <option value="trades">Number of Trades</option>
            <option value="unique">Unique NFTs Traded</option>
          </select>
        </div>

        {/* Prizes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-400">Prizes (Top 10)</label>
            <button
              onClick={addPrize}
              disabled={prizes.length >= 10}
              className="flex items-center gap-1 px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Prize
            </button>
          </div>

          <div className="space-y-3">
            {prizes.map((prize, index) => (
              <div key={index} className="flex gap-3 items-center p-4 bg-[#1a1a25] rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center font-bold text-white">
                  #{prize.rank}
                </div>
                
                <select
                  value={prize.type}
                  onChange={(e) => updatePrize(index, 'type', e.target.value)}
                  className="bg-[#12121a] border border-gray-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="egld">EGLD</option>
                  <option value="esdt">ESDT Token</option>
                  <option value="nft">NFT</option>
                  <option value="custom">Custom</option>
                </select>

                <input
                  type="text"
                  value={prize.amount}
                  onChange={(e) => updatePrize(index, 'amount', e.target.value)}
                  placeholder="Amount"
                  className="w-24 bg-[#12121a] border border-gray-700 rounded-lg px-3 py-2 text-white"
                />

                <input
                  type="text"
                  value={prize.description}
                  onChange={(e) => updatePrize(index, 'description', e.target.value)}
                  placeholder="Description"
                  className="flex-1 bg-[#12121a] border border-gray-700 rounded-lg px-3 py-2 text-white"
                />

                <button
                  onClick={() => removePrize(index)}
                  disabled={prizes.length <= 1}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 rounded-xl border border-cyan-500/20">
          <h3 className="font-bold text-white mb-2">Preview</h3>
          <p className="text-gray-400 text-sm">
            Competition "{name}" will run for {duration} days with {prizes.length} prizes.
            Total prize pool: {prizes.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0)} EGLD equivalent
          </p>
        </div>

        <button
          onClick={createCompetition}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold text-white text-lg hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-all"
        >
          <Save className="w-5 h-5 inline mr-2" />
          Launch Competition
        </button>
      </div>
    </div>
  );
};
