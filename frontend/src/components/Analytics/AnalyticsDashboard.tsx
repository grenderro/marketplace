import React, { useEffect, useState } from 'react';
import { useGetAccountInfo } from '@/hooks/sdkStubs';
import { fetchGlobalStats, fetchLeaderboard } from '@/services/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const AnalyticsDashboard: React.FC = () => {
  const { address } = useGetAccountInfo();
  const [stats, setStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, leaderboardData] = await Promise.all([
        fetchGlobalStats(),
        fetchLeaderboard()
      ]);
      setStats(statsData);
      setLeaderboard(leaderboardData);
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const volumeData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Trading Volume (EGLD)',
      data: stats?.volumeHistory || [12, 19, 15, 25, 22, 30, 28],
      borderColor: 'rgb(234, 179, 8)',
      backgroundColor: 'rgba(234, 179, 8, 0.1)',
      tension: 0.4,
      fill: true,
    }]
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="text-center p-8">
      <p className="text-red-400 mb-4">{error}</p>
      <button onClick={loadData} className="px-4 py-2 bg-yellow-500 text-black rounded-lg">Retry</button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Global Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#12121a] p-6 rounded-xl border border-gray-800">
          <div className="text-gray-400 text-sm mb-2">Total Volume</div>
          <div className="text-2xl font-bold text-yellow-400">
            {stats?.totalVolume || '0'} EGLD
          </div>
        </div>
        <div className="bg-[#12121a] p-6 rounded-xl border border-gray-800">
          <div className="text-gray-400 text-sm mb-2">Total Listings</div>
          <div className="text-2xl font-bold text-cyan-400">
            {stats?.totalListings || '0'}
          </div>
        </div>
        <div className="bg-[#12121a] p-6 rounded-xl border border-gray-800">
          <div className="text-gray-400 text-sm mb-2">Active Users</div>
          <div className="text-2xl font-bold text-purple-400">
            {stats?.activeUsers || '0'}
          </div>
        </div>
        <div className="bg-[#12121a] p-6 rounded-xl border border-gray-800">
          <div className="text-gray-400 text-sm mb-2">Fees Generated</div>
          <div className="text-2xl font-bold text-green-400">
            {stats?.feesGenerated || '0'} EGLD
          </div>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="bg-[#12121a] p-6 rounded-xl border border-gray-800">
        <h3 className="text-lg font-bold mb-4">Volume (7 Days)</h3>
        <div className="h-64">
          <Line data={volumeData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-lg font-bold">Top Traders</h3>
        </div>
        <div className="divide-y divide-gray-800">
          {leaderboard.length > 0 ? leaderboard.map((user, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between hover:bg-[#1a1a25]">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-gray-600">#{idx + 1}</span>
                <span className="font-mono text-gray-300">{user.address?.slice(0, 10)}...</span>
              </div>
              <span className="text-yellow-400 font-bold">{user.volume} EGLD</span>
            </div>
          )) : (
            <div className="p-8 text-center text-gray-500">No leaderboard data yet</div>
          )}
        </div>
      </div>
    </div>
  );
};
