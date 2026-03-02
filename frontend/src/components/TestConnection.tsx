import React, { useEffect, useState } from 'react';
import { fetchGlobalStats, fetchLeaderboard } from '../services/api';

export default function TestConnection() {
  const [stats, setStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGlobalStats()
      .then((data: any) => {
        console.log('Stats:', data);
        setStats(data);
      })
      .catch((err: any) => setError(err.message));

    fetchLeaderboard()
      .then((data: any) => {
        console.log('Leaderboard:', data);
        setLeaderboard(data);
      })
      .catch((err: any) => setError(err.message));
  }, []);

  if (error) return <div style={{color: 'red'}}>Error: {error}</div>;
  if (!stats) return <div>Loading...</div>;
  
  return (
    <div style={{padding: 20}}>
      <h2>Connection Test</h2>
      <pre>{JSON.stringify(stats, null, 2)}</pre>
      <h3>Leaderboard</h3>
      <pre>{JSON.stringify(leaderboard, null, 2)}</pre>
    </div>
  );
}
