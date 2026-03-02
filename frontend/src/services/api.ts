const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const fetchGlobalStats = async () => {
  const res = await fetch(`${API_URL}/api/analytics/global`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
};

export const fetchLeaderboard = async () => {
  const res = await fetch(`${API_URL}/api/analytics/leaderboard`);
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
};

export const fetchListings = async (params?: Record<string, string>) => {
  const query = params ? `?${new URLSearchParams(params)}` : '';
  const res = await fetch(`${API_URL}/api/listings${query}`);
  if (!res.ok) throw new Error('Failed to fetch listings');
  return res.json();
};
