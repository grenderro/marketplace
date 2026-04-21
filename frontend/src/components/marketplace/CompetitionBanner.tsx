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
      className="rounded-2xl mb-6 border"
      style={{
        background: 'linear-gradient(135deg, #001a25 0%, #002233 50%, #001a25 100%)',
        borderColor: 'rgba(0, 212, 255, 0.3)',
        boxShadow: '0 0 30px rgba(0, 212, 255, 0.08), inset 0 1px 0 rgba(0, 212, 255, 0.15)',
      }}
    >
      <div className="px-5 py-5">
        {/* Centered Title Block */}
        <div className="text-center mb-5">
          <h3 className="text-xl font-bold text-white mb-1">{comp.name}</h3>
          <p className="text-sm" style={{ color: 'rgba(0, 212, 255, 0.6)' }}>{comp.description}</p>
        </div>

        {/* Info as horizontal button row */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
          {/* Timer Button */}
          {timeLeft && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-sm"
              style={{
                background: timeLeft.isUrgent ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 212, 255, 0.08)',
                borderColor: timeLeft.isUrgent ? 'rgba(239, 68, 68, 0.4)' : 'rgba(0, 212, 255, 0.25)',
                color: timeLeft.isUrgent ? '#ef4444' : '#00d4ff',
              }}>
              <Clock className="w-4 h-4" />
              <span>
                {timeLeft.days > 0 && `${String(timeLeft.days).padStart(2, '0')}d `}
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          )}

          {/* Stat Buttons */}
          <InfoButton icon={<Users className="w-4 h-4" />} label="Traders" value={comp.totalParticipants.toLocaleString()} />
          <InfoButton icon={<TrendingUp className="w-4 h-4" />} label="Volume" value={`${volumeEGLD} EGLD`} />
          <InfoButton icon={<Flame className="w-4 h-4" />} label="Prize Pool" value={totalPrizeValue > 0 ? `${totalPrizeValue} EGLD+` : 'Exclusive'} />
          <InfoButton icon={<Zap className="w-4 h-4" />} label="Your Rank" value="--" highlight />
        </div>

        {/* CTA */}
        <div className="text-center">
          <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #2dd4bf 100%)',
              color: '#001a25',
              boxShadow: '0 0 20px rgba(0, 212, 255, 0.25)',
            }}>
            Trade Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const InfoButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}> = ({ icon, label, value, highlight }) => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm"
    style={{
      background: highlight ? 'rgba(0, 212, 255, 0.12)' : 'rgba(0, 0, 0, 0.25)',
      borderColor: highlight ? 'rgba(0, 212, 255, 0.35)' : 'rgba(0, 212, 255, 0.15)',
    }}>
    <span style={{ color: '#00d4ff' }}>{icon}</span>
    <span className="font-medium" style={{ color: 'rgba(0, 212, 255, 0.6)' }}>{label}:</span>
    <span className="font-bold text-white">{value}</span>
  </div>
);

export default CompetitionBanner;
