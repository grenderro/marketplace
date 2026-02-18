const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const fetchStats = () => fetch(`${API_URL}/api/analytics/stats`).then(r => r.json());
export const auth = (address: string, signature: string) => 
  fetch(`${API_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, signature, message: 'Login' })
  }).then(r => r.json());
