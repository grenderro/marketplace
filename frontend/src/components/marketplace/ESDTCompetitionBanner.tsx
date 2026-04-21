// components/marketplace/ESDTCompetitionBanner.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Clock,
  Trophy,
  ArrowRight,
  Zap,
  BarChart3,
  Target,
} from 'lucide-react';

interface ESDTCompetition {
  id: number;
  name: string;
  description: string;
  endTime: number;
  prizePool: string;
  prizeToken: string;
  volumeTarget: string;
  currentVolume: string;
  topToken: string;
  participants: number;
}

const DEMO_COMPETITION: ESDTCompetition = {
  id: 1,
  name: 'ESDT Trading Sprint',
  description: 'Trade ESDT tokens and compete for the highest volume. Top traders win EGLD prizes!',
  endTime: Date.now() / 1000 + 86400 * 2 + 3600 * 6,
  prizePool: '25',
  prizeToken: 'EGLD',
  volumeTarget: '100000',
  currentVolume: '67342',
  topToken: 'RIDE',
  participants: 856,
};

const useCountdown = (endTime: number) => {
  const [timeLeft, setTimeLeft] = React.useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isUrgent: boolean;
  } | null>(null);

  React.useEffect(() => {
    const update = () => {
      const diff = Math.max(0, endTime - Date.now() / 1000);
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = Math.floor(diff % 60);
      setTimeLeft({ hours, minutes, seconds, isUrgent: diff < 3600 });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return timeLeft;
};

export const ESDTCompetitionBanner: React.FC = () => {
  const { data: competition } = useQuery({
    queryKey: ['esdt-competition'],
    queryFn: async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (apiUrl && apiUrl !== 'https://devnet-api.multiversx.com') {
        try {
          const res = await fetch(`${apiUrl}/api/competition/esdt`);
          if (res.ok) return res.json();
        } catch { /* fallback */ }
      }
      const res = await fetch('/competitions/esdt.json');
      if (!res.ok) throw new Error('Failed to load');
      return res.json();
    },
    refetchInterval: 60000,
  });

  const comp: ESDTCompetition = competition?.data || competition || DEMO_COMPETITION;
  const timeLeft = useCountdown(comp.endTime);

  const progress = Math.min(
    100,
    (parseFloat(comp.currentVolume) / parseFloat(comp.volumeTarget)) * 100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl mb-6 border"
      style={{
        background: 'linear-gradient(135deg, #001a25 0%, #002233 50%, #001a25 100%)',
        borderColor: 'rgba(0, 212, 255, 0.3)',
        boxShadow: '0 0 30px rgba(0, 212, 255, 0.08), inset 0 1px 0 rgba(0, 212, 255, 0.15)',
      }}
    >
      <div className="relative px-5 py-5">
        {/* Title & Description - Centered */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Zap className="w-4 h-4" style={{ color: '#00d4ff' }} />
            <h3 className="text-lg font-bold text-white">{comp.name}</h3>
            <span className="px-2 py-0.5 text-[10px] rounded-full font-bold flex items-center gap-1"
              style={{ background: 'rgba(0, 212, 255, 0.15)', color: '#00d4ff', border: '1px solid rgba(0, 212, 255, 0.3)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00d4ff' }} />
              LIVE
            </span>
          </div>
          <p className="text-xs max-w-lg mx-auto" style={{ color: 'rgba(0, 212, 255, 0.6)' }}>{comp.description}</p>
        </div>

        {/* Progress Bar - Compact */}
        <div className="max-w-md mx-auto mb-4">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="flex items-center gap-1" style={{ color: 'rgba(0, 212, 255, 0.5)' }}>
              <Target className="w-3 h-3" style={{ color: '#00d4ff' }} /> Volume Progress
            </span>
            <span style={{ color: 'rgba(0, 212, 255, 0.6)' }}>
              {parseFloat(comp.currentVolume).toLocaleString()} / {parseFloat(comp.volumeTarget).toLocaleString()} EGLD
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0, 0, 0, 0.3)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #00d4ff 0%, #2dd4bf 100%)' }}
            />
          </div>
        </div>

        {/* Horizontal Info Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
          {/* Countdown */}
          {timeLeft && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border"
              style={{
                background: timeLeft.isUrgent ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 0, 0, 0.25)',
                borderColor: timeLeft.isUrgent ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 212, 255, 0.15)',
              }}>
              <Clock className="w-3.5 h-3.5" style={{ color: timeLeft.isUrgent ? '#ef4444' : '#00d4ff' }} />
              <div className="flex items-center gap-0.5 font-mono font-bold text-white text-xs">
                <span style={{ color: timeLeft.isUrgent ? '#ef4444' : '#fff' }}>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span style={{ color: 'rgba(0, 212, 255, 0.4)' }}>:</span>
                <span style={{ color: timeLeft.isUrgent ? '#ef4444' : '#fff' }}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span style={{ color: 'rgba(0, 212, 255, 0.4)' }}>:</span>
                <span style={{ color: timeLeft.isUrgent ? '#ef4444' : '#fff' }}>{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>
          )}

          <StatPill icon={<Trophy className="w-3.5 h-3.5" />} label="Prize Pool" value={`${comp.prizePool} ${comp.prizeToken}`} />
          <StatPill icon={<BarChart3 className="w-3.5 h-3.5" />} label="Top Token" value={comp.topToken} />
          <StatPill icon={<TrendingUp className="w-3.5 h-3.5" />} label="Participants" value={comp.participants.toLocaleString()} />
          <StatPill icon={<Zap className="w-3.5 h-3.5" />} label="Progress" value={`${progress.toFixed(0)}%`} highlight />
        </div>

        {/* CTA - Centered */}
        <div className="flex justify-center">
          <button className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #2dd4bf 100%)',
              color: '#001a25',
              boxShadow: '0 0 20px rgba(0, 212, 255, 0.25)',
            }}>
            Start Trading <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const StatPill: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}> = ({ icon, label, value, highlight }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
    style={{
      background: highlight ? 'rgba(0, 212, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)',
      borderColor: highlight ? 'rgba(0, 212, 255, 0.25)' : 'rgba(0, 212, 255, 0.1)',
    }}>
    <span style={{ color: '#00d4ff' }}>{icon}</span>
    <span className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(0, 212, 255, 0.5)' }}>{label}</span>
    <span className="text-xs font-bold text-white">{value}</span>
  </div>
);

export default ESDTCompetitionBanner;
