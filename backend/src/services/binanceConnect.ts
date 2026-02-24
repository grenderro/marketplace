// server/services/binanceConnect.ts
import axios from 'axios';
import crypto from 'crypto';

interface BinanceUser {
  userId: string;
  email: string;
  kycStatus: 'verified' | 'pending' | 'unverified';
  country: string;
}

interface BinanceBalance {
  asset: string;
  free: string;
  locked: string;
  freeze: string;
  withdrawing: string;
  ipoing: string;
  btcValuation: string;
}

interface BinanceWithdrawalRequest {
  coin: string;
  address: string;
  amount: number;
  network: string;
  memo?: string;
}

export class BinanceConnectService {
  private readonly API_BASE = 'https://api.binance.com';
  private readonly CONNECT_BASE = 'https://connect.binance.com';
  private apiKey: string;
  private apiSecret: string;
  private oauthClientId: string;
  private oauthClientSecret: string;

  constructor() {
    this.apiKey = process.env.BINANCE_API_KEY!;
    this.apiSecret = process.env.BINANCE_API_SECRET!;
    this.oauthClientId = process.env.BINANCE_CONNECT_CLIENT_ID!;
    this.oauthClientSecret = process.env.BINANCE_CONNECT_CLIENT_SECRET!;
  }

  // ============== OAUTH AUTHENTICATION ==============

  async getAuthUrl(state: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.oauthClientId,
      response_type: 'code',
      scope: 'read_wallet read_account withdraw',
      redirect_uri: `${process.env.FRONTEND_URL}/auth/binance/callback`,
      state,
    });

    return `${this.CONNECT_BASE}/oauth/authorize?${params}`;
  }

  async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    const response = await axios.post(`${this.CONNECT_BASE}/oauth/token`, {
      grant_type: 'authorization_code',
      client_id: this.oauthClientId,
      client_secret: this.oauthClientSecret,
      code,
      redirect_uri: `${process.env.FRONTEND_URL}/auth/binance/callback`,
    });

    return response.data;
  }

  // ============== USER DATA ==============

  async getUserInfo(accessToken: string): Promise<BinanceUser> {
    const response = await axios.get(`${this.CONNECT_BASE}/api/v1/user`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  }

  async getBalances(accessToken: string): Promise<BinanceBalance[]> {
    const response = await axios.get(
      `${this.CONNECT_BASE}/api/v1/wallet/balances`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data.balances;
  }

  // ============== WITHDRAWAL (PURCHASE FLOW) ==============

  async requestWithdrawal(
    accessToken: string,
    withdrawal: BinanceWithdrawalRequest
  ): Promise<{
    id: string;
    status: 'pending' | 'confirmed' | 'rejected';
    txId?: string;
  }> {
    // This initiates a withdrawal to marketplace escrow address
    const response = await axios.post(
      `${this.CONNECT_BASE}/api/v1/withdraw`,
      withdrawal,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  }

  // ============== WEBHOOK HANDLING ==============

  async handleWebhook(payload: any, signature: string): Promise<void> {
    // Verify Binance signature
    const computed = crypto
      .createHmac('sha256', this.apiSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (computed !== signature) {
      throw new Error('Invalid webhook signature');
    }

    // Handle withdrawal confirmation
    if (payload.event === 'withdrawal_confirmed') {
      await this.processWithdrawalConfirmation(payload.data);
    }
  }

  private async processWithdrawalConfirmation(data: any): Promise<void> {
    // Notify marketplace contract that funds are in escrow
    // Trigger NFT transfer
  }

  // ============== SUPPORTED ASSETS ==============

  async getSupportedWithdrawalNetworks(coin: string): Promise<any[]> {
    const response = await axios.get(
      `${this.API_BASE}/sapi/v1/capital/config/getall`,
      {
        headers: { 'X-MBX-APIKEY': this.apiKey },
        params: { timestamp: Date.now() },
      }
    );

    const coinData = response.data.find((c: any) => c.coin === coin);
    return coinData?.networkList.filter((n: any) => n.withdrawEnable) || [];
  }
}

export const binanceConnect = new BinanceConnectService();
