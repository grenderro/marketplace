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
  endTime: number;
  totalParticipants: number;
  totalVolume: string;
  prizes: Prize[];
}

interface Prize {
  rank: number;
  type: string;
  amount?: string;
  description: string;
  displayValue: string;
}

const DEMO: Competition = {
  id: 1,
  name: 'Spring Trading Championship',
  description: 'Trade NFTs and ESDT tokens to climb the leaderboard and win epic prizes!',
  endTime: Date.now() / 1000 + 86400 * 4 + 3600 * 6,
  totalParticipants: 1247,
  totalVolume: '4500000000000000000000',
  prizes: [
    { rank: 1, type: 'egld', amount: '50', description: 'First place', displayValue: '50 EGLD' },
    { rank: 2, type: 'esdt', amount: '25000', description: 'Second place', displayValue: '25,000 USDC' },
    { rank: 3, type: 'nft', description: 'Legendary NFT', displayValue: 'Legendary NFT' },
  ],
};

const useCountdown = (endTime: number) => {
  const [t, setT] = useState<{ d: number; h: number; m: number; s: number; urgent: boolean } | null>(null);
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, endTime - Date.now() / 1000);
      setT({ d: Math.floor(diff / 86400), h: Math.floor((diff % 86400) / 3600), m: Math.floor((diff % 3600) / 60), s: Math.floor(diff % 60), urgent: diff < 86400 });
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [endTime]);
  return t;
};

export const CompetitionBanner: React.FC = () => {
  const { data: compData } = useQuery({
    queryKey: ['active-competition'],
    queryFn: async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (apiUrl && apiUrl !== 'https://devnet-api.multiversx.com') {
        try { const r = await fetch(`${apiUrl}/api/competition`); if (r.ok) return r.json(); } catch {}
      }
      const r = await fetch('/competitions/active.json');
      if (!r.ok) throw new Error('Failed');
      return r.json();
    },
    refetchInterval: 60000,
  });

  const comp: Competition = compData?.data || compData || DEMO;
  const time = useCountdown(comp.endTime);
  const prize = comp.prizes.filter((p) => p.type === 'egld' && p.amount).reduce((s, p) => s + parseFloat(p.amount || '0'), 0);
  const vol = (parseFloat(comp.totalVolume) / 1e18).toFixed(0);

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

        {/* Horizontal info buttons */}
        <div style={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', overflowX: 'auto', width: '100%' }}>
          {time && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', borderRadius: '0.75rem', border: `1px solid ${time.urgent ? 'rgba(239,68,68,0.4)' : 'rgba(0,212,255,0.25)'}`,
              background: time.urgent ? 'rgba(239,68,68,0.12)' : 'rgba(0,212,255,0.08)', color: time.urgent ? '#ef4444' : '#00d4ff', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', flexShrink: 0
            }}>
              <Clock size={16} />
              {time.d > 0 && `${String(time.d).padStart(2,'0')}d `}{String(time.h).padStart(2,'0')}:{String(time.m).padStart(2,'0')}:{String(time.s).padStart(2,'0')}
            </div>
          )}
          <InfoBtn icon={<Users size={16} />} label="Traders" value={comp.totalParticipants.toLocaleString()} />
          <InfoBtn icon={<TrendingUp size={16} />} label="Volume" value={`${vol} EGLD`} />
          <InfoBtn icon={<Flame size={16} />} label="Prize Pool" value={prize > 0 ? `${prize} EGLD+` : 'Exclusive'} />
          <InfoBtn icon={<Zap size={16} />} label="Your Rank" value="--" highlight />
        </div>

        {/* CTA — centered */}
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.5rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #00d4ff 0%, #2dd4bf 100%)', color: '#001a25', boxShadow: '0 0 20px rgba(0, 212, 255, 0.25)'
        }}>
          Trade Now <ArrowRight size={16} />
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

export default CompetitionBanner;
