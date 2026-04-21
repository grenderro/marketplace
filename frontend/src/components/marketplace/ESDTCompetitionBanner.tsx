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
      className="relative overflow-hidden rounded-2xl mb-6"
      style={{ background: 'linear-gradient(135deg, #0c1220 0%, #0a0e17 50%, #111827 100%)' }}
    >
      {/* Subtle top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

      {/* Background glow orb */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-teal-500/5 rounded-full blur-3xl" />

      <div className="relative p-5 sm:p-6">
        {/* Top row: Title + Timer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #2dd4bf 100%)', boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)' }}>
              <Zap className="w-5 h-5 text-[#0a0e17]" />
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
                <span style={{ color: timeLeft.isUrgent ? '#ef4444' : '#fff' }}>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span style={{ color: '#64748b' }}>:</span>
                <span style={{ color: timeLeft.isUrgent ? '#ef4444' : '#fff' }}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span style={{ color: '#64748b' }}>:</span>
                <span style={{ color: timeLeft.isUrgent ? '#ef4444' : '#fff' }}>{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1" style={{ color: '#64748b' }}>
              <Target className="w-3 h-3" style={{ color: '#00d4ff' }} /> Volume Progress
            </span>
            <span style={{ color: '#94a3b8' }}>
              {parseFloat(comp.currentVolume).toLocaleString()} / {parseFloat(comp.volumeTarget).toLocaleString()} EGLD
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(26, 35, 50, 0.8)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #00d4ff 0%, #2dd4bf 100%)' }}
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <StatBox icon={<Trophy className="w-4 h-4" style={{ color: '#fbbf24' }} />} label="Prize Pool" value={`${comp.prizePool} ${comp.prizeToken}`} />
          <StatBox icon={<BarChart3 className="w-4 h-4" style={{ color: '#00d4ff' }} />} label="Top Token" value={comp.topToken} />
          <StatBox icon={<TrendingUp className="w-4 h-4" style={{ color: '#2dd4bf' }} />} label="Participants" value={comp.participants.toLocaleString()} />
          <StatBox icon={<Zap className="w-4 h-4" style={{ color: '#8b5cf6' }} />} label="Progress" value={`${progress.toFixed(0)}%`} />
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between rounded-xl p-3 border"
          style={{ background: 'rgba(26, 35, 50, 0.5)', borderColor: 'rgba(0, 212, 255, 0.1)' }}>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: '#00d4ff' }} />
            <span className="text-sm" style={{ color: '#94a3b8' }}>
              Trade <strong className="text-white">{comp.topToken}</strong> to climb the leaderboard
            </span>
          </div>
          <button className="flex items-center gap-1 px-4 py-2 rounded-lg text-white text-sm font-bold hover:shadow-lg transition-all shrink-0"
            style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #2dd4bf 100%)', boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)', color: '#0a0e17' }}>
            Start Trading <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

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

export default ESDTCompetitionBanner;
