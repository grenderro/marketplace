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

const DEMO: ESDTCompetition = {
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
  const [t, setT] = React.useState<{ h: number; m: number; s: number; urgent: boolean } | null>(null);
  React.useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, endTime - Date.now() / 1000);
      setT({ h: Math.floor(diff / 3600), m: Math.floor((diff % 3600) / 60), s: Math.floor(diff % 60), urgent: diff < 3600 });
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [endTime]);
  return t;
};

export const ESDTCompetitionBanner: React.FC = () => {
  const { data: compData } = useQuery({
    queryKey: ['esdt-competition'],
    queryFn: async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (apiUrl && apiUrl !== 'https://devnet-api.multiversx.com') {
        try { const r = await fetch(`${apiUrl}/api/competition/esdt`); if (r.ok) return r.json(); } catch {}
      }
      const r = await fetch('/competitions/esdt.json');
      if (!r.ok) throw new Error('Failed');
      return r.json();
    },
    refetchInterval: 60000,
  });

  const comp: ESDTCompetition = compData?.data || compData || DEMO;
  const time = useCountdown(comp.endTime);
  const progress = Math.min(100, (parseFloat(comp.currentVolume) / parseFloat(comp.volumeTarget)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(135deg, #001a25 0%, #002233 50%, #001a25 100%)',
        border: '1px solid rgba(0, 212, 255, 0.3)',
        boxShadow: '0 0 30px rgba(0, 212, 255, 0.08), inset 0 1px 0 rgba(0, 212, 255, 0.15)',
        borderRadius: '1rem',
        marginBottom: '1.5rem',
      }}
    >
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>

        {/* Title — centered */}
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: '0 0 0.25rem 0' }}>{comp.name}</h3>
          <p style={{ fontSize: '0.875rem', color: 'rgba(0, 212, 255, 0.6)', margin: 0 }}>{comp.description}</p>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', maxWidth: '28rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.375rem' }}>
            <span style={{ color: 'rgba(0,212,255,0.5)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Target size={14} style={{ color: '#00d4ff' }} /> Volume Progress
            </span>
            <span style={{ color: 'rgba(0,212,255,0.6)' }}>
              {parseFloat(comp.currentVolume).toLocaleString()} / {parseFloat(comp.volumeTarget).toLocaleString()} EGLD
            </span>
          </div>
          <div style={{ height: '0.375rem', borderRadius: '9999px', overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ height: '100%', borderRadius: '9999px', background: 'linear-gradient(90deg, #00d4ff 0%, #2dd4bf 100%)' }}
            />
          </div>
        </div>

        {/* Horizontal info buttons */}
        <div style={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', overflowX: 'auto', width: '100%' }}>
          {time && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', borderRadius: '0.75rem', border: `1px solid ${time.urgent ? 'rgba(239,68,68,0.4)' : 'rgba(0,212,255,0.25)'}`,
              background: time.urgent ? 'rgba(239,68,68,0.12)' : 'rgba(0,212,255,0.08)', color: time.urgent ? '#ef4444' : '#00d4ff', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', flexShrink: 0
            }}>
              <Clock size={16} />
              {String(time.h).padStart(2,'0')}:{String(time.m).padStart(2,'0')}:{String(time.s).padStart(2,'0')}
            </div>
          )}
          <InfoBtn icon={<Trophy size={16} />} label="Prize Pool" value={`${comp.prizePool} ${comp.prizeToken}`} />
          <InfoBtn icon={<BarChart3 size={16} />} label="Top Token" value={comp.topToken} />
          <InfoBtn icon={<TrendingUp size={16} />} label="Participants" value={comp.participants.toLocaleString()} />
          <InfoBtn icon={<Zap size={16} />} label="Progress" value={`${progress.toFixed(0)}%`} highlight />
        </div>

        {/* CTA — centered */}
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.5rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #00d4ff 0%, #2dd4bf 100%)', color: '#001a25', boxShadow: '0 0 20px rgba(0, 212, 255, 0.25)'
        }}>
          Start Trading <ArrowRight size={16} />
        </button>

      </div>
    </motion.div>
  );
};

const InfoBtn: React.FC<{ icon: React.ReactNode; label: string; value: string; highlight?: boolean }> = ({ icon, label, value, highlight }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', borderRadius: '0.75rem', border: `1px solid ${highlight ? 'rgba(0,212,255,0.35)' : 'rgba(0,212,255,0.15)'}`,
    background: highlight ? 'rgba(0,212,255,0.1)' : 'rgba(0,0,0,0.25)', fontSize: '0.875rem', whiteSpace: 'nowrap', flexShrink: 0
  }}>
    <span style={{ color: '#00d4ff' }}>{icon}</span>
    <span style={{ color: 'rgba(0,212,255,0.55)', fontWeight: 500 }}>{label}:</span>
    <span style={{ color: '#fff', fontWeight: 700 }}>{value}</span>
  </div>
);

export default ESDTCompetitionBanner;
