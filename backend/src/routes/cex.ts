// server/routes/cex.ts
import express from 'express';
import { binanceConnect } from '../services/binanceConnect';

const router = express.Router();

// Initiate Binance OAuth
router.get('/auth/binance', async (req, res) => {
  const { state } = req.query;
  const authUrl = await binanceConnect.getAuthUrl(state as string);
  res.redirect(authUrl);
});

// OAuth callback
router.post('/auth/binance/callback', async (req, res) => {
  try {
    const { code } = req.body;
    
    // Exchange code for tokens
    const tokens = await binanceConnect.exchangeCodeForToken(code);
    
    // Get user info
    const user = await binanceConnect.getUserInfo(tokens.access_token);
    
    // Get balances
    const balances = await binanceConnect.getBalances(tokens.access_token);
    
    // Store tokens securely (encrypted)
    // ... store in database
    
    res.json({
      success: true,
      user,
      balances,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
});

// Initiate CEX purchase
router.post('/initiate-purchase', async (req, res) => {
  try {
    const {
      cexUserId,
      cexSource,
      multiversxAddress,
      nftIdentifier,
      nftNonce,
      seller,
      paymentToken,
      paymentAmount,
    } = req.body;

    // Call smart contract to create escrow
    // This would use mxpy or sdk to call the contract
    
    const result = await callContract('initiateCexPurchase', [
      cexUserId,
      paymentToken,
      paymentAmount,
      nftIdentifier,
      nftNonce,
      seller,
      cexSource === 'binance' ? 0 : 1,
    ]);

    res.json({
      success: true,
      escrowId: result.escrow_id,
      depositAddress: result.deposit_address,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to initiate purchase' });
  }
});

// Binance withdrawal
router.post('/binance/withdraw', async (req, res) => {
  try {
    const { escrowId, coin, amount, address, network } = req.body;
    
    // Get stored access token for user
    const accessToken = await getStoredAccessToken(req.user.id);
    
    // Initiate withdrawal
    const withdrawal = await binanceConnect.requestWithdrawal(accessToken, {
      coin,
      address,
      amount: parseFloat(amount),
      network,
      memo: `ESCROW:${escrowId}`,
    });

    res.json({
      success: true,
      withdrawalId: withdrawal.id,
      status: withdrawal.status,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Withdrawal failed' });
  }
});

// Check escrow status
router.get('/escrow/:escrowId', async (req, res) => {
  try {
    const { escrowId } = req.params;
    
    // Query smart contract
    const escrow = await queryContract('getEscrow', [escrowId]);
    
    res.json({
      success: true,
      status: escrow.status,
      details: escrow,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch escrow' });
  }
});

export default router;
