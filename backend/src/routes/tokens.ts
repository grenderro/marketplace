// server/routes/tokens.ts
import { tokenDiscovery } from '../services/tokenDiscovery';

router.get('/', async (req, res) => {
  try {
    const { 
      tier = 'low',           // all, micro, low, medium, high, institutional
      minLiquidity,           // override: custom min liquidity
      minVolume, 
      search,
      limit = '100',
    } = req.query;

    // Map tier to thresholds
    const tierMap: Record<string, any> = {
      all: { minLiquidityUsd: 10, minVolume24hUsd: 0 },
      micro: { minLiquidityUsd: 50, minVolume24hUsd: 10 },
      low: { minLiquidityUsd: 100, minVolume24hUsd: 50 },
      medium: { minLiquidityUsd: 1000, minVolume24hUsd: 500 },
      high: { minLiquidityUsd: 10000, minVolume24hUsd: 1000 },
      institutional: { minLiquidityUsd: 100000, minVolume24hUsd: 10000 },
    };

    const thresholds = minLiquidity 
      ? { minLiquidityUsd: parseFloat(minLiquidity as string), minVolume24hUsd: parseFloat(minVolume as string) || 0 }
      : (tierMap[tier as string] || tierMap.low);

    const tokens = await tokenDiscovery.discoverLiquidTokens(thresholds);

    // Filter by search if provided
    let filtered = tokens;
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = tokens.filter(t => 
        t.name.toLowerCase().includes(q) ||
        t.symbol.toLowerCase().includes(q) ||
        t.identifier.toLowerCase().includes(q)
      );
    }

    // Limit results
    const limited = filtered.slice(0, parseInt(limit as string));

    res.json({
      success: true,
      tier: tier as string,
      thresholds,
      count: limited.length,
      total: filtered.length,
      data: limited,
      warning: tier === 'micro' || tier === 'all' 
        ? 'Low liquidity tokens may have high slippage. Trade with caution.' 
        : undefined,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch tokens' });
  }
});

// Get tokens by specific liquidity range
router.get('/range/:min/:max', async (req, res) => {
  try {
    const { min, max } = req.params;
    const tokens = await tokenDiscovery.discoverLiquidTokens({
      minLiquidityUsd: parseFloat(min),
      minVolume24hUsd: 0,
    });
    
    const filtered = tokens.filter(t => 
      t.liquidityUsd >= parseFloat(min) && 
      t.liquidityUsd <= parseFloat(max)
    );

    res.json({
      success: true,
      range: { min, max },
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch range' });
  }
});
