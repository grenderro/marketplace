// components/CompetitionBanner.tsx
import { LeaderboardPreview } from '@/components/stubs';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Users, TrendingUp, ChevronRight } from 'lucide-react';

interface Competition {
  id: number;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  status: 'upcoming' | 'active' | 'ended';
  totalParticipants: number;
  totalVolume: string;
  prizes: Prize[];
}

interface Prize {
  rank: number;
  type: 'egld' | 'esdt' | 'nft' | 'custom';
  amount?: string;
  token?: string;
  description: string;
  displayValue: string;
}

export const CompetitionBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isUrgent: boolean;
  } | null>(null);

  const { data: competition } = useQuery({
    queryKey: ['active-competition'],
    queryFn: async () => {
      const res = await fetch('/api/competition/active');
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30s
  });

  useEffect(() => {
    if (!competition?.data) return;

    const updateTimer = () => {
      const now = Date.now() / 1000;
      const end = competition.data.endTime;
      const diff = Math.max(0, end - now);

      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = Math.floor(diff % 60);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isUrgent: diff < 86400, // Less than 1 day
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [competition]);

  if (!competition?.data || competition.data.status !== 'active') {
    return null;
  }

  const comp = competition.data;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      className="bg-gradient-to-r from-purple-900 via-cyan-900 to-purple-900 border-b border-cyan-500/30"
    >
      <div className="max-w-[1600px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Competition Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
                />
              </div>
              <span className="font-bold text-white text-lg hidden sm:block">{comp.name}</span>
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-bold animate-pulse">
                LIVE
              </span>
            </div>

            {/* Timer */}
            {timeLeft && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                timeLeft.isUrgent ? 'bg-red-500/20 border border-red-500/50' : 'bg-black/30'
              }`}>
                <Clock className={`w-4 h-4 ${timeLeft.isUrgent ? 'text-red-400' : 'text-cyan-400'}`} />
                <div className="flex items-center gap-1 font-mono font-bold text-white">
                  {timeLeft.days > 0 ? (
                    <>
                      <span className="text-lg">{timeLeft.days}</span>
                      <span className="text-xs text-gray-400 mr-2">d</span>
                    </>
                  ) : null}
                  <span className={`text-lg ${timeLeft.isUrgent ? 'text-red-400' : ''}`}>
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-gray-400">:</span>
                  <span className={`text-lg ${timeLeft.isUrgent ? 'text-red-400' : ''}`}>
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  {timeLeft.days === 0 && (
                    <>
                      <span className="text-gray-400">:</span>
                      <span className={`text-lg ${timeLeft.isUrgent ? 'text-red-400 animate-pulse' : ''}`}>
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </span>
                    </>
                  )}
                </div>
                {timeLeft.isUrgent && (
                  <span className="text-xs text-red-400 font-bold ml-1">ENDING SOON!</span>
                )}
              </div>
            )}
          </div>

          {/* Center: Stats */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-gray-300">{comp.totalParticipants.toLocaleString()} traders</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">{(parseFloat(comp.totalVolume) / 1e18).toFixed(0)} EGLD vol</span>
            </div>
          </div>

          {/* Right: Prize Preview & CTA */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:block text-right">
              <p className="text-xs text-gray-400">Top Prize</p>
              <p className="font-bold text-yellow-400">{comp.prizes[0]?.displayValue}</p>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-colors"
            >
              {isExpanded ? 'Hide' : 'View Leaderboard'}
              <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
          </div>
        </div>

        {/* Expanded Leaderboard Preview */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              <LeaderboardPreview competitionId={comp.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
