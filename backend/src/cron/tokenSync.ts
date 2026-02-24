// server/cron/tokenSync.ts
import { CronJob } from 'cron';
import { tokenDiscovery } from '../services/tokenDiscovery';
import { SmartContractService } from '../services/contract';

// Run every 5 minutes
export const tokenSyncJob = new CronJob('*/5 * * * *', async () => {
  console.log('🔄 Starting token sync...');
  
  try {
    // Discover current liquid tokens
    const liquidTokens = await tokenDiscovery.discoverLiquidTokens({
      minLiquidityUsd: 10000,
      minVolume24hUsd: 1000,
    });
    
    // Get currently accepted tokens from contract
    const contract = new SmartContractService();
    const currentTokens = await contract.getAcceptedTokens();
    
    // Calculate differences
    const toAdd = liquidTokens
      .filter(t => !currentTokens.includes(t.identifier))
      .map(t => t.identifier);
      
    const toRemove = currentTokens
      .filter(t => !liquidTokens.find(lt => lt.identifier === t))
      .filter(t => t !== 'WEGLD-d7c6bb'); // Never remove core tokens
    
    // Batch update contract if changes detected
    if (toAdd.length > 0 || toRemove.length > 0) {
      console.log(`Adding ${toAdd.length} tokens, removing ${toRemove.length}`);
      await contract.batchUpdateTokens(toAdd, toRemove);
    }
    
    console.log('✅ Token sync complete');
  } catch (error) {
    console.error('❌ Token sync failed:', error);
  }
});
