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

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1 font-medium" style={{ color: 'rgba(0, 212, 255, 0.5)' }}>
              <Target className="w-3.5 h-3.5" style={{ color: '#00d4ff' }} /> Volume Progress
            </span>
            <span className="font-medium" style={{ color: 'rgba(0, 212, 255, 0.6)' }}>
              {parseFloat(comp.currentVolume).toLocaleString()} / {parseFloat(comp.volumeTarget).toLocaleString()} EGLD
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0, 0, 0, 0.3)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #00d4ff 0%, #2dd4bf 100%)' }}
            />
          </div>
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
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          )}

          <InfoButton icon={<Trophy className="w-4 h-4" />} label="Prize Pool" value={`${comp.prizePool} ${comp.prizeToken}`} />
          <InfoButton icon={<BarChart3 className="w-4 h-4" />} label="Top Token" value={comp.topToken} />
          <InfoButton icon={<TrendingUp className="w-4 h-4" />} label="Participants" value={comp.participants.toLocaleString()} />
          <InfoButton icon={<Zap className="w-4 h-4" />} label="Progress" value={`${progress.toFixed(0)}%`} highlight />
        </div>

        {/* CTA */}
        <div className="text-center">
          <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:shadow-lg"
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

export default ESDTCompetitionBanner;
