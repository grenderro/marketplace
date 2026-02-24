// components/Leaderboard.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, ShoppingCart, Tag } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  address: string;
  tag: string;
  totalVolume: string;
  buyVolume: string;
  sellVolume: string;
  tradeCount: number;
  uniqueNfts: number;
  isCurrentUser?: boolean;
}

interface Prize {
  rank: number;
  displayValue: string;
  type: string;
}

export const Leaderboard: React.FC<{
  competitionId: number;
  showFull?: boolean;
}> = ({ competitionId, showFull = false }) => {
  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard', competitionId],
    queryFn: async () => {
      const res = await fetch(`/api/competition/${competitionId}/leaderboard`);
      return res.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: prizes } = useQuery({
    queryKey: ['prizes', competitionId],
    queryFn: async () => {
      const res = await fetch(`/api/competition/${competitionId}/prizes`);
      return res.json();
    },
  });

  const entries: LeaderboardEntry[] = leaderboard?.data || [];
  const prizeList: Prize[] = prizes?.data || [];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-300" />;
      case 3: return <Medal className="w-6 h-6 text-orange-400" />;
      default: return <span className="w-6 h-6 flex items-center justify-center font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/50';
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/50';
      case 3: return 'bg-gradient-to-r from-orange-500/20 to-orange-600/10 border-orange-500/50';
      default: return 'bg-[#12121a] border-gray-800 hover:border-gray-700';
    }
  };

  return (
    <div className="bg-[#0a0a0f] rounded-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Trading Competition
            </h2>
            <p className="text-gray-400 mt-1">Top traders by volume (30 days)</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Your Rank</p>
            <p className="text-2xl font-bold text-cyan-400">--</p>
          </div>
        </div>
      </div>

      {/* Prizes Showcase */}
      <div className="p-6 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 border-b border-gray-800">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Prizes</h3>
        <div className="grid grid-cols-3 gap-4">
          {prizeList.slice(0, 3).map((prize) => (
            <div
              key={prize.rank}
              className={`p-4 rounded-xl border ${
                prize.rank === 1 ? 'bg-yellow-500/10 border-yellow-500/30' :
                prize.rank === 2 ? 'bg-gray-400/10 border-gray-400/30' :
                'bg-orange-500/10 border-orange-500/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {prize.rank === 1 ? '🥇' : prize.rank === 2 ? '🥈' : '🥉'}
                <span className="font-bold text-white">#{prize.rank} Place</span>
              </div>
              <p className="text-lg font-bold text-white">{prize.displayValue}</p>
            </div>
          ))}
        </div>
        {prizeList.length > 3 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            {prizeList.slice(3).map((prize) => (
              <div key={prize.rank} className="p-3 bg-[#12121a] rounded-lg text-center">
                <p className="text-sm text-gray-400">#{prize.rank}</p>
                <p className="font-bold text-white text-sm">{prize.displayValue}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard Table */}
      <div className="divide-y divide-gray-800">
        {entries.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-6xl mb-4">🏁</div>
            <p className="text-xl font-bold text-white mb-2">Competition Just Started!</p>
            <p>Be the first to trade and claim the top spot</p>
          </div>
        ) : (
          entries.map((entry, index) => (
            <motion.div
              key={entry.address}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-4 p-4 border-l-4 ${
                entry.isCurrentUser ? 'border-cyan-500 bg-cyan-500/5' : 'border-transparent'
              } ${getRankStyle(entry.rank)}`}
            >
              {/* Rank */}
              <div className="w-12 flex justify-center">
                {getRankIcon(entry.rank)}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white truncate">
                    {entry.tag || `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
                  </p>
                  {entry.isCurrentUser && (
                    <span className="px-2 py-0.5 bg-cyan-500 text-black text-xs rounded-full font-bold">
                      YOU
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-mono">{entry.address}</p>
              </div>

              {/* Stats */}
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="text-right">
                  <p className="text-gray-400 text-xs">Volume</p>
                  <p className="font-bold text-white">
                    {(parseFloat(entry.totalVolume) / 1e18).toFixed(2)} EGLD
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs">Trades</p>
                  <p className="font-bold text-white">{entry.tradeCount}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs">NFTs</p>
                  <p className="font-bold text-white">{entry.uniqueNfts}</p>
                </div>
              </div>

              {/* Prize */}
              {prizeList.find(p => p.rank === entry.rank) && (
                <div className="hidden lg:block text-right min-w-[120px]">
                  <p className="text-xs text-gray-400">Prize</p>
                  <p className="font-bold text-yellow-400">
                    {prizeList.find(p => p.rank === entry.rank)?.displayValue}
                  </p>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-[#12121a] text-center text-sm text-gray-500">
        <p>Leaderboard updates every 5 minutes • Final results at competition end</p>
      </div>
    </div>
  );
};
