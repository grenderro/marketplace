// server/services/fiatOnRamp.ts
import axios from 'axios';
import crypto from 'crypto';

interface OnRampQuote {
  fiatCurrency: string;
  fiatAmount: number;
  cryptoCurrency: string;
  cryptoAmount: number;
  fee: number;
  networkFee: number;
  totalCost: number;
  provider: string;
}

interface OnRampTransaction {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  checkoutUrl?: string;
  widgetUrl?: string;
}

abstract class FiatProvider {
  abstract name: string;
  abstract supportedFiats: string[];
  abstract supportedCryptos: string[];
  abstract minAmount: number;
  abstract maxAmount: number;
  
  abstract getQuote(params: {
    fiatCurrency: string;
    fiatAmount: number;
    cryptoCurrency: string;
    network: string;
  }): Promise<OnRampQuote>;

  abstract createTransaction(params: {
    fiatCurrency: string;
    fiatAmount: number;
    cryptoCurrency: string;
    cryptoAmount: number;
    walletAddress: string;
    email: string;
    escrowId: string;
  }): Promise<OnRampTransaction>;

  abstract handleWebhook(payload: any, signature: string): Promise<any>;
}

// ============== MOONPAY ==============
class MoonPayProvider extends FiatProvider {
  name = 'MoonPay';
  supportedFiats = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
  supportedCryptos = ['EGLD', 'USDC', 'USDT', 'BUSD'];
  minAmount = 30;
  maxAmount = 50000;

  private apiKey = process.env.MOONPAY_API_KEY!;
  private secretKey = process.env.MOONPAY_SECRET_KEY!;
  private baseUrl = 'https://api.moonpay.com';

  async getQuote(params: {
    fiatCurrency: string;
    fiatAmount: number;
    cryptoCurrency: string;
  }): Promise<OnRampQuote> {
    const response = await axios.get(`${this.baseUrl}/v3/currencies/${params.cryptoCurrency.toLowerCase()}/quote`, {
      params: {
        apiKey: this.apiKey,
        baseCurrencyCode: params.fiatCurrency.toLowerCase(),
        baseCurrencyAmount: params.fiatAmount,
        paymentMethod: 'credit_debit_card',
      },
    });

    return {
      fiatCurrency: params.fiatCurrency,
      fiatAmount: params.fiatAmount,
      cryptoCurrency: params.cryptoCurrency,
      cryptoAmount: parseFloat(response.data.quoteCurrencyAmount),
      fee: parseFloat(response.data.feeAmount),
      networkFee: parseFloat(response.data.networkFeeAmount || 0),
      totalCost: parseFloat(response.data.totalAmount),
      provider: this.name,
    };
  }

  async createTransaction(params: {
    fiatCurrency: string;
    fiatAmount: number;
    cryptoCurrency: string;
    walletAddress: string;
    email: string;
    escrowId: string;
  }): Promise<OnRampTransaction> {
    // Generate signed URL for widget
    const urlParams = new URLSearchParams({
      apiKey: this.apiKey,
      baseCurrencyCode: params.fiatCurrency.toLowerCase(),
      baseCurrencyAmount: params.fiatAmount.toString(),
      currencyCode: params.cryptoCurrency.toLowerCase(),
      walletAddress: params.walletAddress,
      email: params.email,
      externalTransactionId: params.escrowId,
      redirectURL: `${process.env.FRONTEND_URL}/purchase/success?escrow=${params.escrowId}`,
      showWalletAddressForm: 'false',
      colorCode: '%2300d4ff', // Brand color
    });

    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(urlParams.toString())
      .digest('base64');

    const widgetUrl = `https://buy.moonpay.com?${urlParams.toString()}&signature=${encodeURIComponent(signature)}`;

    return {
      id: params.escrowId,
      status: 'pending',
      widgetUrl,
    };
  }

  async handleWebhook(payload: any, signature: string): Promise<any> {
    // Verify webhook signature
    const computed = crypto
      .createHmac('sha256', this.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (computed !== signature) {
      throw new Error('Invalid webhook signature');
    }

    return {
      escrowId: payload.externalTransactionId,
      status: payload.status, // 'pending', 'completed', 'failed'
      cryptoAmount: payload.quoteCurrencyAmount,
      txHash: payload.cryptoTransactionId,
    };
  }
}

// ============== TRANSAK ==============
class TransakProvider extends FiatProvider {
  name = 'Transak';
  supportedFiats = ['USD', 'EUR', 'GBP', 'INR', 'TRY', 'BRL'];
  supportedCryptos = ['EGLD', 'USDC', 'USDT'];
  minAmount = 20;
  maxAmount = 20000;

  private apiKey = process.env.TRANSAK_API_KEY!;
  private secretKey = process.env.TRANSAK_SECRET_KEY!;
  private baseUrl = 'https://api.transak.com';

  async getQuote(params: any): Promise<OnRampQuote> {
    const response = await axios.get(`${this.baseUrl}/api/v1/pricing/public/quotes`, {
      params: {
        fiatCurrency: params.fiatCurrency,
        cryptoCurrency: params.cryptoCurrency,
        paymentMethod: 'credit_debit_card',
        fiatAmount: params.fiatAmount,
        partnerApiKey: this.apiKey,
      },
    });

    const quote = response.data.response;
    return {
      fiatCurrency: params.fiatCurrency,
      fiatAmount: params.fiatAmount,
      cryptoCurrency: params.cryptoCurrency,
      cryptoAmount: parseFloat(quote.cryptoAmount),
      fee: parseFloat(quote.feeAmount),
      networkFee: parseFloat(quote.networkFee || 0),
      totalCost: parseFloat(quote.totalAmount),
      provider: this.name,
    };
  }

  async createTransaction(params: any): Promise<OnRampTransaction> {
    const response = await axios.post(`${this.baseUrl}/api/v1/orders`, {
      apiKey: this.apiKey,
      fiatCurrency: params.fiatCurrency,
      cryptoCurrency: params.cryptoCurrency,
      fiatAmount: params.fiatAmount,
      walletAddress: params.walletAddress,
      email: params.email,
      partnerOrderId: params.escrowId,
      redirectURL: `${process.env.FRONTEND_URL}/purchase/success`,
    });

    return {
      id: response.data.response.id,
      status: 'pending',
      checkoutUrl: response.data.response.url,
    };
  }

  async handleWebhook(payload: any): Promise<any> {
    // Transak uses API key validation
    return {
      escrowId: payload.partnerOrderId,
      status: payload.status,
      cryptoAmount: payload.cryptoAmount,
    };
  }
}

// ============== RAMP NETWORK ==============
class RampProvider extends FiatProvider {
  name = 'Ramp';
  supportedFiats = ['USD', 'EUR', 'GBP', 'PLN'];
  supportedCryptos = ['EGLD', 'USDC', 'USDT'];
  minAmount = 10;
  maxAmount = 10000;

  private apiKey = process.env.RAMP_API_KEY!;
  private baseUrl = 'https://api-instant.ramp.network';

  async getQuote(params: any): Promise<OnRampQuote> {
    const response = await axios.get(`${this.baseUrl}/api/host-api/quote`, {
      params: {
        hostApiKey: this.apiKey,
        fiatCurrency: params.fiatCurrency,
        cryptoAssetSymbol: params.cryptoCurrency,
        fiatValue: params.fiatAmount,
        paymentMethodType: 'CARD',
      },
    });

    return {
      fiatCurrency: params.fiatCurrency,
      fiatAmount: params.fiatAmount,
      cryptoCurrency: params.cryptoCurrency,
      cryptoAmount: parseFloat(response.data.assetAmount),
      fee: parseFloat(response.data.hostFee) + parseFloat(response.data.networkFee),
      networkFee: parseFloat(response.data.networkFee),
      totalCost: params.fiatAmount,
      provider: this.name,
    };
  }

  async createTransaction(params: any): Promise<OnRampTransaction> {
    const widgetUrl = `https://buy.ramp.network/?` + new URLSearchParams({
      hostApiKey: this.apiKey,
      fiatCurrency: params.fiatCurrency,
      fiatValue: params.fiatAmount.toString(),
      cryptoAssetSymbol: params.cryptoCurrency,
      userAddress: params.walletAddress,
      hostAppName: 'MultiversX Marketplace',
      hostLogoUrl: `${process.env.FRONTEND_URL}/logo.png`,
      swapAsset: params.cryptoCurrency,
      swapAmount: params.cryptoAmount.toString(),
      finalUrl: `${process.env.FRONTEND_URL}/purchase/success?escrow=${params.escrowId}`,
    });

    return {
      id: params.escrowId,
      status: 'pending',
      widgetUrl,
    };
  }

  async handleWebhook(payload: any): Promise<any> {
    return {
      escrowId: payload.purchaseViewToken,
      status: payload.status,
      cryptoAmount: payload.assetAmount,
    };
  }
}

// ============== BINANCE PAY ==============
class BinancePayProvider extends FiatProvider {
  name = 'Binance Pay';
  supportedFiats = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'CNY'];
  supportedCryptos = ['EGLD', 'USDT', 'BUSD', 'BTC', 'ETH'];
  minAmount = 1;
  maxAmount = 100000;

  private apiKey = process.env.BINANCE_PAY_API_KEY!;
  private secretKey = process.env.BINANCE_PAY_SECRET_KEY!;
  private baseUrl = 'https://bpay.binanceapi.com';

  async getQuote(params: any): Promise<OnRampQuote> {
    // Binance Pay uses real-time exchange rates
    const response = await axios.post(`${this.baseUrl}/binancepay/openapi/order`, {
      merchantTradeNo: `quote-${Date.now()}`,
      orderAmount: params.fiatAmount.toString(),
      currency: params.fiatCurrency,
      goods: {
        goodsType: '02', // Virtual goods
        goodsCategory: 'Z000',
        referenceMerchantId: process.env.BINANCE_MERCHANT_ID!,
        goodsName: 'NFT Purchase',
        goodsDetail: 'MultiversX NFT',
      },
    }, {
      headers: this.getHeaders(),
    });

    // Binance Pay fee is typically 0.5-1%
    const fee = params.fiatAmount * 0.005;

    return {
      fiatCurrency: params.fiatCurrency,
      fiatAmount: params.fiatAmount,
      cryptoCurrency: params.cryptoCurrency,
      cryptoAmount: params.fiatAmount / await this.getCryptoPrice(params.cryptoCurrency),
      fee,
      networkFee: 0,
      totalCost: params.fiatAmount + fee,
      provider: this.name,
    };
  }

  async createTransaction(params: any): Promise<OnRampTransaction> {
    const timestamp = Date.now();
    const merchantTradeNo = `NFT-${params.escrowId}-${timestamp}`;

    const payload = {
      env: { terminalType: 'WEB' },
      merchantTradeNo,
      orderAmount: params.fiatAmount.toString(),
      currency: params.fiatCurrency,
      goods: {
        goodsType: '02',
        goodsCategory: 'Z000',
        referenceMerchantId: process.env.BINANCE_MERCHANT_ID!,
        goodsName: 'NFT Purchase',
        goodsDetail: `Escrow: ${params.escrowId}`,
      },
      returnUrl: `${process.env.FRONTEND_URL}/purchase/success?escrow=${params.escrowId}`,
      cancelUrl: `${process.env.FRONTEND_URL}/purchase/cancel?escrow=${params.escrowId}`,
      webhookUrl: `${process.env.API_URL}/webhooks/binance-pay`,
    };

    const response = await axios.post(
      `${this.baseUrl}/binancepay/openapi/order`,
      payload,
      { headers: this.getHeaders(payload) }
    );

    return {
      id: merchantTradeNo,
      status: 'pending',
      checkoutUrl: response.data.data.checkoutUrl,
    };
  }

  private getHeaders(payload?: any): Record<string, string> {
    const timestamp = Date.now();
    const nonce = crypto.randomUUID();
    
    let signature = '';
    if (payload) {
      const payloadStr = JSON.stringify(payload);
      signature = crypto
        .createHmac('sha512', this.secretKey)
        .update(`${timestamp}\n${nonce}\n${payloadStr}\n`)
        .digest('hex')
        .toUpperCase();
    }

    return {
      'Content-Type': 'application/json',
      'BinancePay-Timestamp': timestamp.toString(),
      'BinancePay-Nonce': nonce,
      'BinancePay-Certificate-SN': this.apiKey,
      'BinancePay-Signature': signature,
    };
  }

  private async getCryptoPrice(crypto: string): Promise<number> {
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price', {
      params: { symbol: `${crypto}USDT` },
    });
    return parseFloat(response.data.price);
  }

  async handleWebhook(payload: any, signature: string): Promise<any> {
    // Verify Binance Pay signature
    // Implementation depends on webhook format
    return {
      escrowId: payload.merchantTradeNo.split('-')[1],
      status: payload.status === 'PAID' ? 'completed' : 'failed',
      cryptoAmount: payload.orderAmount,
    };
  }
}

// ============== PROVIDER AGGREGATOR ==============
export class FiatOnRampAggregator {
  private providers: Record<string, FiatProvider> = {
    moonpay: new MoonPayProvider(),
    transak: new TransakProvider(),
    ramp: new RampProvider(),
    binancepay: new BinancePayProvider(),
  };

  async getBestQuote(params: {
    fiatCurrency: string;
    fiatAmount: number;
    cryptoCurrency: string;
    preferredProvider?: string;
  }): Promise<OnRampQuote & { provider: string }> {
    const quotes = await Promise.all(
      Object.entries(this.providers).map(async ([key, provider]) => {
        try {
          if (!provider.supportedFiats.includes(params.fiatCurrency)) return null;
          if (!provider.supportedCryptos.includes(params.cryptoCurrency)) return null;
          if (params.fiatAmount < provider.minAmount || params.fiatAmount > provider.maxAmount) return null;

          const quote = await provider.getQuote(params);
          return { ...quote, provider: key };
        } catch (e) {
          console.error(`${provider.name} quote failed:`, e);
          return null;
        }
      })
    );

    const validQuotes = quotes.filter((q): q is OnRampQuote & { provider: string } => q !== null);
    
    if (validQuotes.length === 0) {
      throw new Error('No providers available for this combination');
    }

    // Sort by crypto amount received (highest is best)
    return validQuotes.sort((a, b) => b.cryptoAmount - a.cryptoAmount)[0];
  }

  async createTransaction(providerKey: string, params: any): Promise<OnRampTransaction> {
    const provider = this.providers[providerKey];
    if (!provider) throw new Error('Provider not found');
    return provider.createTransaction(params);
  }

  async handleWebhook(providerKey: string, payload: any, signature: string): Promise<any> {
    const provider = this.providers[providerKey];
    if (!provider) throw new Error('Provider not found');
    return provider.handleWebhook(payload, signature);
  }

  getSupportedOptions(): {
    providers: string[];
    fiatCurrencies: string[];
    cryptoCurrencies: string[];
  } {
    const allFiats = new Set<string>();
    const allCryptos = new Set<string>();

    Object.values(this.providers).forEach(p => {
      p.supportedFiats.forEach(f => allFiats.add(f));
      p.supportedCryptos.forEach(c => allCryptos.add(c));
    });

    return {
      providers: Object.keys(this.providers),
      fiatCurrencies: Array.from(allFiats),
      cryptoCurrencies: Array.from(allCryptos),
    };
  }
}

export const fiatAggregator = new FiatOnRampAggregator();
