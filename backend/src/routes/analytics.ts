// server/analytics.ts
import express from 'express';
import { ClickHouse } from 'clickhouse';

const clickhouse = new ClickHouse({
  url: process.env.CLICKHOUSE_URL,
  config: { database: 'marketplace' }
});

const router = express.Router();

// Time-series data for charts
router.get('/volume', async (req, res) => {
  const { timeframe = '24h', collection } = req.query;
  
  const query = `
    SELECT 
      toStartOfInterval(timestamp, INTERVAL 1 ${timeframe === '24h' ? 'HOUR' : 'DAY'}) as time,
      sum(price) as volume,
      count() as sales,
      avg(price) as avg_price
    FROM sales
    WHERE timestamp >= now() - INTERVAL 1 ${timeframe === '24h' ? 'DAY' : 'MONTH'}
    ${collection ? `AND collection_id = '${collection}'` : ''}
    GROUP BY time
    ORDER BY time
  `;
  
  const data = await clickhouse.query(query).toPromise();
  res.json(data);
});

// Top collections leaderboard
router.get('/leaderboard', async (req, res) => {
  const query = `
    SELECT 
      collection_id,
      any(collection_name) as name,
      count() as sales,
      sum(price) as volume,
      uniq(buyer) as unique_buyers,
      max(price) as max_sale
    FROM sales
    WHERE timestamp >= now() - INTERVAL 7 DAY
    GROUP BY collection_id
    ORDER BY volume DESC
    LIMIT 10
  `;
  
  const data = await clickhouse.query(query).toPromise();
  res.json(data);
});

// User portfolio analytics
router.get('/portfolio/:address', async (req, res) => {
  const { address } = req.params;
  
  const [owned, sold, bought, profit] = await Promise.all([
    // Current holdings
    clickhouse.query(`
      SELECT 
        collection_id,
        count() as items,
        sum(last_price) as estimated_value
      FROM holdings
      WHERE owner = '${address}'
      GROUP BY collection_id
    `).toPromise(),
    
    // Sales history
    clickhouse.query(`
      SELECT 
        count() as total_sales,
        sum(price) as total_volume,
        max(price) as highest_sale
      FROM sales
      WHERE seller = '${address}'
    `).toPromise(),
    
    // Purchase history
    clickhouse.query(`
      SELECT 
        count() as total_buys,
        sum(price) as total_spent
      FROM sales
      WHERE buyer = '${address}'
    `).toPromise(),
    
    // Profit calculation
    clickhouse.query(`
      SELECT 
        sum(if(seller = '${address}', price, 0)) - 
        sum(if(buyer = '${address}', price, 0)) as net_profit
      FROM sales
      WHERE seller = '${address}' OR buyer = '${address}'
    `).toPromise()
  ]);
  
  res.json({ owned, sold, bought, profit });
});

// Real-time stats
router.get('/stats', async (req, res) => {
  const query = `
    SELECT 
      (SELECT count() FROM listings WHERE status = 'active') as active_listings,
      (SELECT count() FROM auctions WHERE status = 'active') as active_auctions,
      (SELECT sum(price) FROM sales WHERE timestamp >= now() - INTERVAL 24 HOUR) as volume_24h,
      (SELECT uniq(buyer) FROM sales WHERE timestamp >= now() - INTERVAL 24 HOUR) as unique_traders_24h
  `;
  
  const data = await clickhouse.query(query).toPromise();
  res.json(data[0]);
});

export default router;
