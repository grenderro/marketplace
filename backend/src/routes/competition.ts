// server/routes/competition.ts
import express from 'express';

const router = express.Router();

// Get active competition
router.get('/active', async (req, res) => {
  try {
    const competition = await callContract('getActiveCompetition', []);
    
    if (!competition) {
      return res.json({ success: true, data: null });
    }

    // Enrich with calculated data
    const now = Math.floor(Date.now() / 1000);
    const timeRemaining = Math.max(0, competition.endTime - now);
    
    res.json({
      success: true,
      data: {
        ...competition,
        timeRemaining,
        isUrgent: timeRemaining < 86400,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch competition' });
  }
});

// Get leaderboard
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const { id } = req.params;
    const { top = '10' } = req.query;

    // This would typically come from indexed database for performance
    // Contract call is fallback for verification
    const leaderboard = await callContract('getLeaderboard', [id, parseInt(top as string)]);
    
    // Enrich with tags from database/cache
    const enriched = await Promise.all(
      leaderboard.map(async (entry: any) => ({
        ...entry,
        tag: await getUserTag(entry.address),
      }))
    );

    res.json({
      success: true,
      data: enriched,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
  }
});

// Get prizes
router.get('/:id/prizes', async (req, res) => {
  try {
    const { id } = req.params;
    const competition = await callContract('getCompetition', [id]);
    
    const formattedPrizes = competition.prizes.map((p: any) => ({
      rank: p.rank,
      type: p.prize_type,
      displayValue: formatPrizeDisplay(p),
      description: p.description,
    }));

    res.json({
      success: true,
      data: formattedPrizes,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch prizes' });
  }
});

// Get user stats
router.get('/:id/user/:address', async (req, res) => {
  try {
    const { id, address } = req.params;
    const stats = await callContract('getParticipantStats', [id, address]);
    
    // Get rank from leaderboard
    const leaderboard = await callContract('getLeaderboard', [id, 100]);
    const rank = leaderboard.findIndex((e: any) => e.address === address) + 1;

    res.json({
      success: true,
      data: {
        ...stats,
        rank: rank || null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user stats' });
  }
});

// Create competition (admin)
router.post('/create', async (req, res) => {
  try {
    const { name, durationDays, scoringType, prizes } = req.body;

    const result = await callContract('createCompetition', [
      name,
      'Trade NFTs to win prizes!',
      durationDays * 86400,
      scoringType === 'volume' ? 0 : scoringType === 'buys' ? 1 : scoringType === 'sells' ? 2 : scoringType === 'trades' ? 3 : 4,
      0, // min volume threshold
      prizes.map((p: any) => [p.rank, p.type, p.description]),
    ]);

    res.json({
      success: true,
      competitionId: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create competition' });
  }
});

function formatPrizeDisplay(prize: any): string {
  switch (prize.prize_type) {
    case 'Egld':
      return `${prize.amount} EGLD`;
    case 'Esdt':
      return `${prize.amount} ${prize.token}`;
    case 'Nft':
      return 'Exclusive NFT';
    case 'Custom':
      return prize.metadata || 'Special Prize';
    default:
      return 'Mystery Prize';
  }
}

async function getUserTag(address: string): Promise<string> {
  // Fetch from database or contract
  return '';
}

export default router;
