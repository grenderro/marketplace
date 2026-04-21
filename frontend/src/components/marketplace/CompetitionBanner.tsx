// components/marketplace/CompetitionBanner.tsx
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Trophy,
  Clock,
  Users,
  TrendingUp,
  ArrowRight,
  Zap,
  Flame,
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
  } | null>(null);

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, endTime - Date.now() / 1000);
      setTimeLeft({
        days: Math.floor(diff / 86400),
        hours: Math.floor((diff % 86400) / 3600),
        minutes: Math.floor((diff % 3600) / 60),
        seconds: Math.floor(diff % 60),
        isUrgent: diff < 86400,
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
  const { data: competition } = useQuery({
    queryKey: ['active-competition'],
    queryFn: async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (apiUrl && apiUrl !== 'https://devnet-api.multiversx.com') {
        try {
          const res = await fetch(`${apiUrl}/api/competition`);
          if (res.ok) return res.json();
        } catch { /* fallback */ }
      }
      const res = await fetch('/competitions/active.json');
      if (!res.ok) throw new Error('Failed to load competition data');
      return res.json();
    },
    refetchInterval: 60000,
  });

  const comp: Competition = competition?.data || competition || DEMO_COMPETITION;
  const timeLeft = useCountdown(comp.endTime);

  const totalPrizeValue = comp.prizes
    .filter((p) => p.type === 'egld' && p.amount)
    .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

  const volumeEGLD = (parseFloat(comp.totalVolume) / 1e18).toFixed(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl mb-6"
      style={{ background: 'linear-gradient(135deg, #0c1220 0%, #0a0e17 50%, #111827 100%)' }}
    >
      {/* Subtle top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

      {/* Background glow orb */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="relative p-5 sm:p-6">
        {/* Top row: Title + Timer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #2dd4bf 100%)', boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)' }}>
              <Trophy className="w-5 h-5 text-[#0a0e17]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{comp.name}</h3>
                <span className="px-2 py-0.5 text-[10px] rounded-full font-bold flex items-center gap-1"
                  style={{ background: 'rgba(0, 212, 255, 0.15)', color: '#00d4ff', border: '1px solid rgba(0, 212, 255, 0.25)' }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00d4ff' }} />
                  LIVE
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{comp.description}</p>
            </div>
          </div>

          {/* Countdown */}
          {timeLeft && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border shrink-0"
              style={{
                background: timeLeft.isUrgent ? 'rgba(239, 68, 68, 0.1)' : 'rgba(26, 35, 50, 0.6)',
                borderColor: timeLeft.isUrgent ? 'rgba(239, 68, 68, 0.3)' : 'rgba(148, 163, 184, 0.1)',
                backdropFilter: 'blur(8px)',
              }}>
              <Clock className="w-4 h-4" style={{ color: timeLeft.isUrgent ? '#ef4444' : '#00d4ff' }} />
              <div className="flex items-center gap-1 font-mono font-bold text-white text-sm">
                {timeLeft.days > 0 && (
                  <>
                    <span style={{ color: timeLeft.isUrgent ? '#ef4444' : '#fff' }}>{String(timeLeft.days).padStart(2, '0')}</span>
                    <span style={{ color: '#64748b' }}>:</span>
                  </>
                )}
                <span style={{ color: timeLeft.isUrgent ? '#ef4444' : '#fff' }}>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span style={{ color: '#64748b' }}>:</span>
                <span style={{ color: timeLeft.isUrgent ? '#ef4444' : '#fff' }}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span style={{ color: '#64748b' }}>:</span>
                <span style={{ color: timeLeft.isUrgent ? '#ef4444' : '#fff' }}>{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <StatBox icon={<Users className="w-4 h-4" style={{ color: '#00d4ff' }} />} label="Traders" value={comp.totalParticipants.toLocaleString()} />
          <StatBox icon={<TrendingUp className="w-4 h-4" style={{ color: '#2dd4bf' }} />} label="Volume" value={`${volumeEGLD} EGLD`} />
          <StatBox icon={<Flame className="w-4 h-4" style={{ color: '#f59e0b' }} />} label="Prize Pool" value={totalPrizeValue > 0 ? `${totalPrizeValue} EGLD+` : 'Exclusive Prizes'} />
          <StatBox icon={<Zap className="w-4 h-4" style={{ color: '#8b5cf6' }} />} label="Your Rank" value="--" />
        </div>

        {/* Prize preview + CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl p-3 border"
          style={{ background: 'rgba(26, 35, 50, 0.5)', borderColor: 'rgba(0, 212, 255, 0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {comp.prizes.slice(0, 3).map((prize, i) => (
                <div key={prize.rank} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
                  style={{
                    background: i === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : i === 1 ? 'linear-gradient(135deg, #9ca3af, #6b7280)' : 'linear-gradient(135deg, #f97316, #ea580c)',
                    borderColor: '#0a0e17',
                    color: '#0a0e17',
                  }}>
                  #{prize.rank}
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm text-white font-medium">Start trading to earn points</p>
              <p className="text-xs" style={{ color: '#64748b' }}>Every buy, sell, and listing counts toward your score</p>
            </div>
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#0a0e17] hover:shadow-lg transition-all shrink-0"
            style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #2dd4bf 100%)', boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)' }}>
            Trade Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Subcomponents ─────────────────────────────────────────

const StatBox: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="rounded-xl p-3 border" style={{ background: 'rgba(26, 35, 50, 0.6)', borderColor: 'rgba(148, 163, 184, 0.1)' }}>
    <div className="flex items-center gap-1.5 mb-1">
      {icon}
      <span className="text-[10px] uppercase tracking-wider" style={{ color: '#64748b' }}>{label}</span>
    </div>
    <p className="text-white font-bold text-sm">{value}</p>
  </div>
);

export default CompetitionBanner;
