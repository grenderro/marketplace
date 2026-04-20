/**
 * AWS Lambda — Minimal Fiat Webhook Handler
 * Deploy this to AWS Lambda (Node.js 20.x) to receive fiat provider callbacks.
 *
 * Required environment variables:
 * - MOONPAY_SECRET_KEY
 * - TRANSAK_SECRET_KEY
 * - CONTRACT_ADDRESS (your MultiversX marketplace contract)
 * - NETWORK_PROVIDER (e.g. https://devnet-gateway.multiversx.com)
 */

import { createHmac } from 'crypto';

interface WebhookEvent {
  httpMethod: string;
  path: string;
  headers: Record<string, string>;
  body: string;
}

interface WebhookResponse {
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
}

const MOONPAY_SECRET = process.env.MOONPAY_SECRET_KEY || '';
const TRANSAK_SECRET = process.env.TRANSAK_SECRET_KEY || '';

function verifyMoonPaySignature(payload: string, signature: string): boolean {
  if (!MOONPAY_SECRET) return false;
  const computed = createHmac('sha256', MOONPAY_SECRET)
    .update(payload)
    .digest('hex');
  return computed === signature;
}

function verifyTransakSignature(payload: string, signature: string): boolean {
  // Transak typically uses API key validation rather than HMAC
  // Implement according to your Transak dashboard settings
  return !!TRANSAK_SECRET;
}

export const handler = async (event: WebhookEvent): Promise<WebhookResponse> => {
  const path = event.path;
  const method = event.httpMethod;

  if (method !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    if (path.includes('/webhooks/moonpay')) {
      const signature = event.headers['X-Signature'] || event.headers['x-signature'] || '';
      if (!verifyMoonPaySignature(event.body, signature)) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Invalid signature' }) };
      }

      const payload = JSON.parse(event.body);
      console.log('MoonPay webhook received:', payload);

      // TODO: Here you would:
      // 1. Verify the escrow exists in your database (DynamoDB)
      // 2. Call your smart contract's confirmFiatPayment endpoint via a relayer
      // 3. Update escrow status

      return {
        statusCode: 200,
        body: JSON.stringify({ received: true, provider: 'moonpay', escrowId: payload.externalTransactionId }),
      };
    }

    if (path.includes('/webhooks/transak')) {
      const payload = JSON.parse(event.body);
      console.log('Transak webhook received:', payload);

      return {
        statusCode: 200,
        body: JSON.stringify({ received: true, provider: 'transak', orderId: payload.partnerOrderId }),
      };
    }

    if (path.includes('/webhooks/binance-pay')) {
      const payload = JSON.parse(event.body);
      console.log('Binance Pay webhook received:', payload);

      return {
        statusCode: 200,
        body: JSON.stringify({ received: true, provider: 'binancepay' }),
      };
    }

    return { statusCode: 404, body: JSON.stringify({ error: 'Unknown webhook path' }) };
  } catch (err: any) {
    console.error('Webhook error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

// For local testing with serverless-offline or ts-node
if (require.main === module) {
  console.log('Webhook handler loaded. Set environment variables and deploy to AWS Lambda.');
}
