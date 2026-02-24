// server/routes/listings.ts
import express from 'express';
import { nftAggregator } from '../aggregator/nftAggregator';

const router = express.Router();

// GET /api/listings - All NFTs for sale
router.get('/', async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page as string) || 1,
      limit: Math.min(parseInt(req.query.limit as string) || 20, 100),
      sortBy: (req.query.sortBy as any) || 'recent',
      collection: req.query.collection as string,
      search: req.query.search as string,
      minPrice: req.query.minPrice as string,
      maxPrice: req.query.maxPrice as string,
      type: (req.query.type as any) || 'all',
    };

    const result = await nftAggregator.getAllListings(filters);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Listings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch listings',
    });
  }
});

// GET /api/listings/collections - Top collections
router.get('/collections', async (req, res) => {
  try {
    const collections = await nftAggregator.getTopCollections();
    res.json({ success: true, data: collections });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch collections' });
  }
});

// GET /api/listings/:identifier - Specific NFT details
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const listing = await nftAggregator.getListingDetails(identifier);
    
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    
    res.json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch details' });
  }
});

// GET /api/listings/collection/:collectionId - Collection floor/activity
router.get('/collection/:collectionId', async (req, res) => {
  try {
    const { collectionId } = req.params;
    const stats = await nftAggregator.getCollectionStats(collectionId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch collection' });
  }
});

export default router;
