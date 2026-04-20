// components/marketplace/CompetitionBanner.tsx
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Clock,
  Users,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Flame,
  Medal,
  Crown,
  Award,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────
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

// ─── Demo Data ─────────────────────────────────────────────
const DEMO_COMPETITION: Competition = {
  id: 1,
  name: 'Spring Trading Championship',
  description: 'Trade NFTs and ESDT tokens to climb the leaderboard and win epic prizes!',
  startTime: Date.now() / 1000 - 86400 * 3,
  endTime: Date.now() / 1000 + 86400 * 4 + 3600 * 6,
  status: 'active',
  totalParticipants: 1247,
  totalVolume: '4500000000000000000000',
  prizes: [
    { rank: 1, type: 'egld', amount: '50', description: 'First place', displayValue: '50 EGLD' },
    { rank: 2, type: 'esdt', amount: '25000', token: 'USDC-350c4e', description: 'Second place', displayValue: '25,000 USDC' },
    { rank: 3, type: 'nft', description: 'Legendary NFT', displayValue: 'Legendary NFT' },
    { rank: 4, type: 'custom', description: 'Mystery Box', displayValue: 'Mystery Box' },
    { rank: 5, type: 'custom', description: 'Mystery Box', displayValue: 'Mystery Box' },
  ],
};

// ─── Countdown Hook ────────────────────────────────────────
const useCountdown = (endTime: number) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isUrgent: boolean;
    progress: number;
  } | null>(null);

  useEffect(() => {
    const update = () => {
      const now = Date.now() / 1000;
      const diff = Math.max(0, endTime - now);

      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = Math.floor(diff % 60);

      // Calculate progress (assume 7-day competition for demo)
      const totalDuration = 7 * 86400;
      const progress = Math.min(100, Math.max(0, ((totalDuration - diff) / totalDuration) * 100));

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isUrgent: diff < 86400,
        progress,
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return timeLeft;
};

// ─── Component ─────────────────────────────────────────────
export const CompetitionBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: competition } = useQuery({
    queryKey: ['active-competition'],
    queryFn: async () => {
      // Try API endpoint first (for dynamic/serverless mode)
      const apiUrl = process.env.REACT_APP_API_URL;
      if (apiUrl && apiUrl !== 'https://devnet-api.multiversx.com') {
        try {
          const res = await fetch(`${apiUrl}/api/competition`);
          if (res.ok) return res.json();
        } catch {
          // Fallback to static JSON
        }
      }
      // Static JSON fallback — works with any static host (GitHub Pages, Vercel, etc.)
      const res = await fetch('/competitions/active.json');
      if (!res.ok) throw new Error('Failed to load competition data');
      return res.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Use fetched data, or demo fallback if fetch fails
  const comp: Competition = competition?.data || competition || DEMO_COMPETITION;
  const timeLeft = useCountdown(comp.endTime);

  const totalPrizeValue = comp.prizes
    .filter((p) => p.type === 'egld' && p.amount)
    .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

  const volumeEGLD = (parseFloat(comp.totalVolume) / 1e18).toFixed(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      {/* Background Gradient with animated glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-[#0a0a1a] to-cyan-950" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50" />

      {/* Animated orbs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-0 right-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"
      />

      <div className="relative max-w-[1600px] mx-auto px-4 py-6">
        {/* Top Row: Title + Live Badge + Timer */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          {/* Left: Title & Description */}
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0a0a1a]"
              />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white">{comp.name}</h2>
                <span className="px-2.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-bold border border-green-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="text-sm text-gray-400 max-w-lg">{comp.description}</p>
            </div>
          </div>

          {/* Right: Countdown */}
          {timeLeft && (
            <div
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl border backdrop-blur-sm ${
                timeLeft.isUrgent
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-black/20 border-white/10'
              }`}
            >
              <Clock className={`w-5 h-5 ${timeLeft.isUrgent ? 'text-red-400' : 'text-cyan-400'}`} />
              <div className="flex items-center gap-2">
                {timeLeft.days > 0 && (
                  <CountdownUnit value={timeLeft.days} label="DAYS" urgent={timeLeft.isUrgent} />
                )}
                <CountdownUnit value={timeLeft.hours} label="HRS" urgent={timeLeft.isUrgent} />
                <CountdownUnit value={timeLeft.minutes} label="MIN" urgent={timeLeft.isUrgent} />
                {timeLeft.days === 0 && (
                  <CountdownUnit value={timeLeft.seconds} label="SEC" urgent={timeLeft.isUrgent} />
                )}
              </div>
              {timeLeft.isUrgent && (
                <span className="text-xs text-red-400 font-bold animate-pulse hidden sm:block">
                  ENDING SOON!
                </span>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {timeLeft && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Competition Progress</span>
              <span>{timeLeft.progress.toFixed(0)}% complete</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${timeLeft.progress}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  timeLeft.isUrgent
                    ? 'bg-gradient-to-r from-red-500 to-orange-500'
                    : 'bg-gradient-to-r from-cyan-500 to-purple-500'
                }`}
              />
            </div>
          </div>
        )}

        {/* Middle Row: Stats + Prizes + CTA */}
        <div className="grid lg:grid-cols-3 gap-4 mb-4">
          {/* Stats Card */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <div className="grid grid-cols-2 gap-4">
              <StatItem
                icon={<Users className="w-4 h-4" />}
                label="Traders"
                value={comp.totalParticipants.toLocaleString()}
              />
              <StatItem
                icon={<TrendingUp className="w-4 h-4" />}
                label="Volume"
                value={`${volumeEGLD} EGLD`}
              />
              <StatItem
                icon={<Flame className="w-4 h-4" />}
                label="Prize Pool"
                value={totalPrizeValue > 0 ? `${totalPrizeValue} EGLD+` : 'Exclusive Prizes'}
              />
              <StatItem
                icon={<Zap className="w-4 h-4" />}
                label="Your Rank"
                value="--"
                highlight
              />
            </div>
          </div>

          {/* Prize Podium */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" /> Prize Pool
              </h3>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                {isExpanded ? (
                  <>
                    Hide details <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    View all prizes <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
            <div className="flex items-end justify-center gap-3 h-28">
              {/* 2nd Place */}
              {comp.prizes[1] && (
                <PrizePodium
                  rank={2}
                  prize={comp.prizes[1]}
                  height="h-16"
                  color="from-gray-400 to-gray-500"
                  icon={<Medal className="w-5 h-5" />}
                />
              )}
              {/* 1st Place */}
              {comp.prizes[0] && (
                <PrizePodium
                  rank={1}
                  prize={comp.prizes[0]}
                  height="h-24"
                  color="from-yellow-400 to-amber-500"
                  icon={<Crown className="w-6 h-6" />}
                  isWinner
                />
              )}
              {/* 3rd Place */}
              {comp.prizes[2] && (
                <PrizePodium
                  rank={3}
                  prize={comp.prizes[2]}
                  height="h-12"
                  color="from-amber-600 to-orange-700"
                  icon={<Award className="w-5 h-5" />}
                />
              )}
            </div>
          </div>
        </div>

        {/* CTA Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl p-4 border border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-white font-medium">Start trading to earn points</p>
              <p className="text-xs text-gray-400">Every buy, sell, and listing counts toward your score</p>
            </div>
          </div>
          <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2">
            Trade Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Expanded Prize Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-white/10">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Full Prize Breakdown</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {comp.prizes.map((prize, idx) => (
                    <motion.div
                      key={prize.rank}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-4 rounded-xl border ${
                        prize.rank === 1
                          ? 'bg-yellow-500/10 border-yellow-500/30'
                          : prize.rank === 2
                          ? 'bg-gray-500/10 border-gray-500/30'
                          : prize.rank === 3
                          ? 'bg-orange-500/10 border-orange-500/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                            prize.rank === 1
                              ? 'bg-yellow-500 text-black'
                              : prize.rank === 2
                              ? 'bg-gray-400 text-black'
                              : prize.rank === 3
                              ? 'bg-orange-600 text-white'
                              : 'bg-gray-700 text-gray-400'
                          }`}
                        >
                          #{prize.rank}
                        </span>
                        <span className="text-xs text-gray-500 uppercase">
                          {prize.type}
                        </span>
                      </div>
                      <p className="text-white font-bold text-sm">{prize.displayValue}</p>
                      <p className="text-xs text-gray-400 mt-1">{prize.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ─── Subcomponents ─────────────────────────────────────────

const CountdownUnit: React.FC<{
  value: number;
  label: string;
  urgent: boolean;
}> = ({ value, label, urgent }) => (
  <div className="flex flex-col items-center">
    <div
      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-mono font-bold text-lg sm:text-xl ${
        urgent
          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
          : 'bg-black/30 text-white border border-white/10'
      }`}
    >
      {String(value).padStart(2, '0')}
    </div>
    <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{label}</span>
  </div>
);

const StatItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}> = ({ icon, label, value, highlight }) => (
  <div className="flex items-center gap-3">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${highlight ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-gray-400'}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-cyan-400' : 'text-white'}`}>{value}</p>
    </div>
  </div>
);

const PrizePodium: React.FC<{
  rank: number;
  prize: Prize;
  height: string;
  color: string;
  icon: React.ReactNode;
  isWinner?: boolean;
}> = ({ rank, prize, height, color, icon, isWinner }) => (
  <div className="flex flex-col items-center gap-2 flex-1">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, delay: rank * 0.1 }}
      className={`relative ${isWinner ? 'z-10' : ''}`}
    >
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg ${
          isWinner ? 'shadow-yellow-500/30' : ''
        }`}
      >
        {icon}
      </div>
      {isWinner && (
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </motion.div>
      )}
    </motion.div>
    <div
      className={`w-full max-w-[100px] ${height} rounded-t-lg bg-gradient-to-t ${color} opacity-80 flex items-end justify-center pb-2`}
    >
      <span className="text-white font-bold text-xs">#{rank}</span>
    </div>
    <p className="text-white text-xs font-medium text-center truncate w-full px-1">{prize.displayValue}</p>
  </div>
);

export default CompetitionBanner;
