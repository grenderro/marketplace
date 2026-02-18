// backend/src/routes/analytics.ts
import express from 'express';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 });
const router = express.Router();

// Simple mock data (no database needed for now)
router.get('/stats', (req, res) => {
  try {
    const mockData = {
      active_listings: 42,
      active_auctions: 5,
      volume_24h: 1250.5,
      unique_traders_24h: 18
    };
    
    res.json(mockData);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
