/**
 * AWS Lambda — Competition Data Endpoint
 * Returns active competition data. Deploy to Lambda + API Gateway.
 *
 * Optional: Connect to DynamoDB or RDS for dynamic data.
 * For now, returns static data (same as frontend/public/competitions/active.json).
 */

interface Competition {
  id: number;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  status: 'upcoming' | 'active' | 'ended';
  totalParticipants: number;
  totalVolume: string;
  prizes: Prize[];
}

interface Prize {
  rank: number;
  type: 'egld' | 'esdt' | 'nft' | 'custom';
  amount?: string;
  token?: string;
  description: string;
  displayValue: string;
}

const ACTIVE_COMPETITION: Competition = {
  id: 1,
  name: 'Spring Trading Championship',
  description: 'Trade NFTs and ESDT tokens to climb the leaderboard and win epic prizes!',
  startTime: 1744800000,
  endTime: 1745404800,
  status: 'active',
  totalParticipants: 1247,
  totalVolume: '4500000000000000000000',
  prizes: [
    { rank: 1, type: 'egld', amount: '50', description: 'First place champion', displayValue: '50 EGLD' },
    { rank: 2, type: 'esdt', amount: '25000', token: 'USDC-350c4e', description: 'Second place', displayValue: '25,000 USDC' },
    { rank: 3, type: 'nft', description: 'Legendary NFT from top collection', displayValue: 'Legendary NFT' },
    { rank: 4, type: 'custom', description: 'Exclusive mystery box', displayValue: 'Mystery Box' },
    { rank: 5, type: 'custom', description: 'Exclusive mystery box', displayValue: 'Mystery Box' },
  ],
};

export const handler = async (event: any) => {
  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method || 'GET';

  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (path.includes('/leaderboard')) {
    // Future: fetch from DynamoDB
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        data: {
          leaderboard: [
            { rank: 1, address: 'erd1...abc', volume: '1200.5', trades: 45 },
            { rank: 2, address: 'erd1...def', volume: '980.2', trades: 38 },
            { rank: 3, address: 'erd1...ghi', volume: '750.8', trades: 29 },
          ],
        },
      }),
    };
  }

  // Default: return active competition
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ data: ACTIVE_COMPETITION }),
  };
};

// For local testing
if (require.main === module) {
  handler({ path: '/competition', httpMethod: 'GET' }).then((res: any) => {
    console.log('Response:', JSON.stringify(JSON.parse(res.body), null, 2));
  });
}
