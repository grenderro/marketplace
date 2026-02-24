// server/routes/fiat.ts
import express from 'express';
import { fiatAggregator } from '../services/fiatOnRamp';

const router = express.Router();

// Get best quote
router.post('/quote', async (req, res) => {
  try {
    const { fiatCurrency, fiatAmount, cryptoCurrency } = req.body;
    
    const quote = await fiatAggregator.getBestQuote({
      fiatCurrency,
      fiatAmount,
      cryptoCurrency,
    });

    res.json({
      success: true,
      ...quote,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get quote' });
  }
});

// Create escrow
router.post('/escrow', async (req, res) => {
  try {
    const {
      provider,
      fiatAmount,
      fiatCurrency,
      cryptoCurrency,
      multiversxAddress,
      email,
      nftIdentifier,
    } = req.body;

    // Call smart contract to create fiat escrow
    const result = await callContract('createFiatEscrow', [
      getProviderCode(provider),
      fiatAmount,
      fiatCurrency,
      cryptoCurrency,
      nftIdentifier,
      multiversxAddress,
      hashEmail(email),
    ]);

    res.json({
      success: true,
      escrowId: result.escrow_id,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create escrow' });
  }
});

// Create transaction
router.post('/transaction', async (req, res) => {
  try {
    const {
      provider,
      escrowId,
      fiatCurrency,
      fiatAmount,
      cryptoCurrency,
      cryptoAmount,
      walletAddress,
      email,
    } = req.body;

    const transaction = await fiatAggregator.createTransaction(provider, {
      fiatCurrency,
      fiatAmount,
      cryptoCurrency,
      cryptoAmount,
      walletAddress,
      email,
      escrowId,
    });

    res.json({
      success: true,
      ...transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create transaction' });
  }
});

// Webhooks
router.post('/webhook/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const signature = req.headers['x-signature'] as string;
    
    const result = await fiatAggregator.handleWebhook(provider, req.body, signature);
    
    // Update smart contract
    await callContract('confirmFiatPayment', [
      result.escrowId,
      result.txHash,
      result.cryptoAmount,
      true, // kyc verified
    ]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Webhook failed' });
  }
});

// Get supported options
router.get('/options', async (req, res) => {
  res.json(fiatAggregator.getSupportedOptions());
});

function getProviderCode(provider: string): number {
  const codes: Record<string, number> = {
    moonpay: 0,
    transak: 1,
    ramp: 2,
    binancepay: 3,
  };
  return codes[provider] || 0;
}

function hashEmail(email: string): string {
  return crypto.createHash('sha256').update(email).digest('hex');
}

export default router;
