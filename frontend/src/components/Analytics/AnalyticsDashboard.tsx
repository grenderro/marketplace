// components/AnalyticsDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';

export const AnalyticsDashboard: React.FC = () => {
  const { address } = useGetAccountInfo();
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [stats, setStats] = useState<any>(null);
  const [volumeData, setVolumeData] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchVolume();
    fetchLeaderboard();
  }, [timeframe]);

  const fetchStats = async () => {
    const res = await fetch('/api/analytics/stats');
    setStats(await res.json());
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a25',
        titleColor: '#fff',
        bodyColor: '#00d4ff',
        borderColor: '#00d4ff',
        borderWidth: 1
      }
    },
    scales: {
      x: { 
        grid: { color: '#252535' },
        ticks: { color: '#606070' }
      },
      y: { 
        grid: { color: '#252535' },
        ticks: { color: '#606070' }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Active Listings"
          value={stats?.active_listings || 0}
          icon="🏷️"
          color="cyan"
        />
        <StatCard 
          title="Live Auctions"
          value={stats?.active_auctions || 0}
          icon="⏰"
          color="purple"
        />
        <StatCard 
          title="24h Volume"
          value={`${(stats?.volume_24h || 0).toFixed(2)} EGLD`}
          icon="📈"
          color="green"
          trend="+12.5%"
        />
        <StatCard 
          title="Unique Traders"
          value={stats?.unique_traders_24h || 0}
          icon="👥"
          color="pink"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Volume Chart */}
        <div className="lg:col-span-2 bg-[#12121a] rounded-2xl p-6 border border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Trading Volume</h3>
            <div className="flex gap-2">
              {(['24h', '7d', '30d'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1 rounded-lg text-sm font-bold ${
                    timeframe === t 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-[#1a1a25] text-gray-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Line 
            data={{
              labels: volumeData?.map((d: any) => d.time) || [],
              datasets: [{
                label: 'Volume (EGLD)',
                data: volumeData?.map((d: any) => d.volume) || [],
                borderColor: '#00d4ff',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                fill: true,
                tension: 0.4
              }]
            }}
            options={chartOptions}
          />
        </div>

        {/* Top Collections */}
        <div className="bg-[#12121a] rounded-2xl p-6 border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-6">Top Collections</h3>
          <div className="space-y-4">
            {leaderboard.map((col, idx) => (
              <div key={col.collection_id} className="flex items-center gap-4">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                  idx === 1 ? 'bg-gray-400/20 text-gray-300' :
                  idx === 2 ? 'bg-orange-600/20 text-orange-400' :
                  'bg-[#1a1a25] text-gray-500'
                }`}>
                  {idx + 1}
                </span>
                <img 
                  src={`https://ipfs.io/ipfs/${col.image}`} 
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">{col.name}</p>
                  <p className="text-xs text-gray-400">{col.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-cyan-400">{col.volume.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">EGLD</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Portfolio (if connected) */}
      {address && <PortfolioAnalytics address={address} />}
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: string;
}> = ({ title, value, icon, color, trend }) => (
  <div className="bg-[#12121a] rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <span className="text-3xl">{icon}</span>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
          trend.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {trend}
        </span>
      )}
    </div>
    <p className="text-3xl font-bold text-white mb-1">{value}</p>
    <p className={`text-sm font-medium`} style={{ color: `var(--accent-${color})` }}>
      {title}
    </p>
  </div>
);
