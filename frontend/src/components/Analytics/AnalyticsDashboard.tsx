import React, { useEffect, useState } from 'react';

export const AnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/analytics/stats')
      .then(r => r.json())
      .then(setStats);
  }, []);

  return (
    <div className="p-6 grid grid-cols-4 gap-4">
      <StatCard title="Active Listings" value={stats?.active_listings || 0} icon="🏷️" />
      <StatCard title="24h Volume" value={`${stats?.volume_24h || 0} EGLD`} icon="📈" />
      <StatCard title="Auctions" value={stats?.active_auctions || 0} icon="⏰" />
      <StatCard title="Traders" value={stats?.unique_traders_24h || 0} icon="👥" />
    </div>
  );
};

const StatCard: React.FC<{title: string, value: string | number, icon: string}> = ({title, value, icon}) => (
  <div className="bg-gray-800 p-4 rounded-xl text-white">
    <div className="text-2xl mb-2">{icon}</div>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-sm text-gray-400">{title}</div>
  </div>
);
