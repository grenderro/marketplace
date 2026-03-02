import { Router } from 'express';
import Redis from 'ioredis';
import { 
    listingRepository, 
    collectionRepository, 
    competitionRepository,
    userRepository 
} from '../data-source';
import { authenticate } from '../middleware/auth';

const router = Router();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const CACHE_TTL = 300;

async function getCachedOrFetch(key: string, fetchFn: () => Promise<any>, ttl = CACHE_TTL) {
    try {
        const cached = await redis.get(key);
        if (cached) return JSON.parse(cached);
    } catch (e: any) {
        console.log('Redis error:', e.message);
    }
    const data = await fetchFn();
    try {
        await redis.setex(key, ttl, JSON.stringify(data));
    } catch (e: any) {}
    return data;
}

// 1. Global Stats
// 1. Global Stats
router.get('/stats', async (req, res) => {
    try {
        const data = await getCachedOrFetch('analytics:stats', async () => {
            const repo = listingRepository();
            
            const result = await repo.query(`
                SELECT 
                    (SELECT COUNT(*) FROM listings WHERE status = 'active') as active_listings,
                    (SELECT COUNT(*) FROM listings WHERE status = 'sold' AND created_at > NOW() - INTERVAL '24 hours') as sales_24h,
                    (SELECT COALESCE(SUM(price), 0) FROM listings WHERE status = 'sold' AND created_at > NOW() - INTERVAL '24 hours') as volume_24h,
                    (SELECT COUNT(DISTINCT seller) FROM listings WHERE created_at > NOW() - INTERVAL '7 days') as active_sellers,
                    (SELECT COUNT(DISTINCT buyer) FROM listings WHERE status = 'sold' AND created_at > NOW() - INTERVAL '7 days') as active_buyers
            `);
            
            return {
                active_listings: parseInt(result[0].active_listings),
                sales_24h: parseInt(result[0].sales_24h),
                volume_24h: result[0].volume_24h,
                active_sellers: parseInt(result[0].active_sellers),
                active_buyers: parseInt(result[0].active_buyers)
            };
        }, 60);
        
        res.json(data);
    } catch (error: any) {
        console.error('Stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const { type = 'volume', period = 'all' } = req.query;
        const repo = listingRepository();
        
        let timeFilter = '';
        if (period === 'week') timeFilter = "AND created_at > NOW() - INTERVAL '7 days'";
        else if (period === 'month') timeFilter = "AND created_at > NOW() - INTERVAL '30 days'";
        
        let query: string;
        if (type === 'volume') {
            query = `
                SELECT buyer as address, SUM(price) as volume, COUNT(*) as purchases 
                FROM listings 
                WHERE status = 'sold' ${timeFilter}
                GROUP BY buyer 
                ORDER BY volume DESC 
                LIMIT 100
            `;
        } else {
            query = `
                SELECT seller as address, SUM(price) as volume_sold, COUNT(*) as sales 
                FROM listings 
                WHERE status = 'sold' ${timeFilter}
                GROUP BY seller 
                ORDER BY volume_sold DESC 
                LIMIT 100
            `;
        }
        
        const data = await repo.query(query);
        res.json(data);
    } catch (error: any) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Top Collections
router.get('/collections/top', async (req, res) => {
    try {
        const { limit = 10, timeframe = '7d' } = req.query;
        const repo = listingRepository();
        
        let interval = timeframe === '24h' ? '1 day' : '7 days';
        
        const data = await repo.query(`
            SELECT 
                c.collection_id as id,
                c.name as name,
                c.image_url as image,
                COUNT(l.id) as sold,
                SUM(l.price) as volume,
                AVG(l.price) as avg_price,
                MIN(l.price) as floor
            FROM listings l
            JOIN collections c ON l.collection_id = c.collection_id
            WHERE l.status = 'sold' 
            AND l.created_at > NOW() - INTERVAL '${interval}'
            GROUP BY c.collection_id, c.name, c.image_url
            ORDER BY volume DESC
            LIMIT ${parseInt(limit as string)}
        `);
        
        res.json(data);
    } catch (error: any) {
        console.error('Collections error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 4. Price History
router.get('/price-history/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        const { days = 30 } = req.query;
        const repo = listingRepository();

        if (type === 'nft') {
            const data = await repo.query(`
                SELECT created_at as date, price, seller, buyer
                FROM listings
                WHERE nft_id = $1 AND status = 'sold'
                ORDER BY created_at DESC
                LIMIT 100
            `, [id]);
            res.json(data);
        } else {
            const data = await repo.query(`
                SELECT 
                    DATE_TRUNC('day', created_at) as date,
                    MIN(price) as floor_price,
                    AVG(price) as avg_price,
                    COUNT(*) as sales_count
                FROM listings
                WHERE collection_id = $1 
                AND status = 'sold'
                AND created_at > NOW() - INTERVAL '${parseInt(days as string)} days'
                GROUP BY DATE_TRUNC('day', created_at)
                ORDER BY date ASC
            `, [id]);
            res.json(data);
        }
    } catch (error: any) {
        console.error('Price history error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 5. Competition (protected)
router.get('/competition/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const compRepo = competitionRepository();
        const listingRepo = listingRepository();
        
        const competition = await compRepo.findOne({ where: { id } });
        if (!competition) {
            res.status(404).json({ error: 'Competition not found' });
            return;
        }
        
        const [stats, leaders] = await Promise.all([
            listingRepo.query(`
                SELECT 
                    COUNT(DISTINCT seller) as participants,
                    SUM(CASE WHEN status = 'sold' THEN price ELSE 0 END) as total_volume,
                    COUNT(CASE WHEN status = 'sold' THEN 1 END) as sales_count
                FROM listings
                WHERE created_at BETWEEN $1 AND $2
            `, [competition.start_date, competition.end_date]),
            
            listingRepo.query(`
                SELECT 
                    seller as address,
                    COUNT(*) as items_listed,
                    SUM(CASE WHEN status = 'sold' THEN price ELSE 0 END) as volume
                FROM listings
                WHERE created_at BETWEEN $1 AND $2
                GROUP BY seller
                ORDER BY items_listed DESC
                LIMIT 20
            `, [competition.start_date, competition.end_date])
        ]);
        
        res.json({ competition, stats: stats[0], leaderboard: leaders });
    } catch (error: any) {
        console.error('Competition error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 6. User Analytics (protected)
router.get('/user/:address', authenticate, async (req, res) => {
    try {
        const { address } = req.params;
        const repo = listingRepository();
        
        const result = await repo.query(`
            SELECT 
                (SELECT COUNT(*) FROM listings WHERE seller = $1) as total_listings,
                (SELECT COUNT(*) FROM listings WHERE seller = $1 AND status = 'sold') as sold_items,
                (SELECT COALESCE(SUM(price), 0) FROM listings WHERE seller = $1 AND status = 'sold') as total_sales,
                (SELECT COALESCE(SUM(price), 0) FROM listings WHERE buyer = $1) as total_purchases,
                (SELECT AVG(price) FROM listings WHERE seller = $1 AND status = 'sold') as avg_sale_price
        `, [address]);
        
        res.json({
            total_listings: parseInt(result[0].total_listings),
            sold_items: parseInt(result[0].sold_items),
            total_sales_volume: result[0].total_sales,
            total_purchases: result[0].total_purchases,
            avg_sale_price: result[0].avg_sale_price || 0
        });
    } catch (error: any) {
        console.error('User analytics error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
