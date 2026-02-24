// server/routes/social.ts
import express from 'express';

const router = express.Router();

// Like an item
router.post('/like', async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    const userAddress = req.user?.address; // From auth middleware

    const result = await callContract('likeItem', [
      getTargetTypeCode(targetType),
      targetId,
    ]);

    res.json({ success: true, likes: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to like' });
  }
});

// Unlike
router.post('/unlike', async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    
    const result = await callContract('unlikeItem', [
      getTargetTypeCode(targetType),
      targetId,
    ]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to unlike' });
  }
});

// Report item
router.post('/report', async (req, res) => {
  try {
    const { targetType, targetId, reason, description, evidenceUrl } = req.body;
    const userAddress = req.user?.address;

    // Rate limit: max 10 reports per day per user
    const dailyReports = await getDailyReportCount(userAddress);
    if (dailyReports >= 10) {
      return res.status(429).json({ success: false, error: 'Report limit reached' });
    }

    const result = await callContract('reportItem', [
      getTargetTypeCode(targetType),
      targetId,
      reason,
      description,
      evidenceUrl || null,
    ]);

    res.json({ success: true, reportId: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to submit report' });
  }
});

// Get likes for item
router.get('/likes/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const userAddress = req.query.user as string;

    const [count, hasLiked] = await Promise.all([
      callContract('getItemLikes', [getTargetTypeCode(type), id]),
      userAddress ? callContract('hasLiked', [userAddress, getTargetTypeCode(type), id]) : false,
    ]);

    res.json({
      success: true,
      count,
      hasLiked,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch likes' });
  }
});

// Get user reputation
router.get('/reputation/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const reputation = await callContract('getUserReputation', [address]);
    
    res.json({
      success: true,
      data: reputation,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch reputation' });
  }
});

// Admin: Get pending reports
router.get('/admin/reports', async (req, res) => {
  try {
    const { status = 'pending', offset = 0, limit = 20 } = req.query;
    
    // Verify admin权限
    if (!req.user?.isAdmin) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const reports = await callContract('getPendingReports', [offset, limit]);
    
    res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch reports' });
  }
});

// Admin: Resolve report
router.post('/admin/resolve-report', async (req, res) => {
  try {
    const { reportId, isValid, notes } = req.body;
    
    if (!req.user?.isAdmin) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const result = await callContract('resolveReport', [reportId, isValid, notes]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to resolve report' });
  }
});

function getTargetTypeCode(type: string): number {
  const codes: Record<string, number> = {
    nft: 0,
    collection: 1,
    user: 2,
    listing: 3,
  };
  return codes[type] || 0;
}

export default router;
