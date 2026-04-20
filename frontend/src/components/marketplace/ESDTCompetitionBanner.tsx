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
        } catch {
          // fallback
        }
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
      style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #082f49 50%, #0f172a 100%)' }}
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow orb */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="relative p-5 sm:p-6">
        {/* Top row: Title + Timer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{comp.name}</h3>
                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] rounded-full font-bold border border-cyan-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="text-xs text-cyan-200/60 mt-0.5">{comp.description}</p>
            </div>
          </div>

          {/* Countdown */}
          {timeLeft && (
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                timeLeft.isUrgent
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-black/20 border-white/10'
              }`}
            >
              <Clock
                className={`w-4 h-4 ${timeLeft.isUrgent ? 'text-red-400' : 'text-cyan-400'}`}
              />
              <div className="flex items-center gap-1 font-mono font-bold text-white text-sm">
                <span className={timeLeft.isUrgent ? 'text-red-400' : ''}>
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-gray-500">:</span>
                <span className={timeLeft.isUrgent ? 'text-red-400' : ''}>
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-gray-500">:</span>
                <span className={timeLeft.isUrgent ? 'text-red-400 animate-pulse' : ''}>
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-cyan-200/50 flex items-center gap-1">
              <Target className="w-3 h-3" /> Volume Progress
            </span>
            <span className="text-cyan-200/70">
              {parseFloat(comp.currentVolume).toLocaleString()} /{' '}
              {parseFloat(comp.volumeTarget).toLocaleString()} EGLD
            </span>
          </div>
          <div className="h-2 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-400"
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <StatBox
            icon={<Trophy className="w-4 h-4 text-yellow-400" />}
            label="Prize Pool"
            value={`${comp.prizePool} ${comp.prizeToken}`}
          />
          <StatBox
            icon={<BarChart3 className="w-4 h-4 text-cyan-400" />}
            label="Top Token"
            value={comp.topToken}
          />
          <StatBox
            icon={<TrendingUp className="w-4 h-4 text-green-400" />}
            label="Participants"
            value={comp.participants.toLocaleString()}
          />
          <StatBox
            icon={<Zap className="w-4 h-4 text-purple-400" />}
            label="Progress"
            value={`${progress.toFixed(0)}%`}
          />
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-100/80">
              Trade <strong className="text-white">{comp.topToken}</strong> to climb the
              leaderboard
            </span>
          </div>
          <button className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg text-white text-sm font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all shrink-0">
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
  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
    <div className="flex items-center gap-1.5 mb-1">
      {icon}
      <span className="text-[10px] text-cyan-200/50 uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-white font-bold text-sm">{value}</p>
  </div>
);

export default ESDTCompetitionBanner;
