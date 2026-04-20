// components/FiatPurchaseWidget.tsx — Direct fiat on-ramp (no backend escrow)
// Redirects users to MoonPay/Transak widgets. Users receive crypto in their wallet
// and then use it to buy NFTs directly on the blockchain.
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Shield, Zap } from 'lucide-react';

interface Quote {
  provider: string;
  fiatAmount: number;
  fiatCurrency: string;
  cryptoAmount: number;
  cryptoCurrency: string;
  fee: number;
  networkFee: number;
  totalCost: number;
}

const PROVIDER_INFO: Record<string, { name: string; color: string; icon: string; features: string[]; widgetUrl: string }> = {
  moonpay: {
    name: 'MoonPay',
    color: 'bg-purple-500',
    icon: '🌙',
    features: ['160+ countries', 'Apple Pay', 'Google Pay', 'Bank transfer'],
    widgetUrl: 'https://buy.moonpay.com',
  },
  transak: {
    name: 'Transak',
    color: 'bg-blue-500',
    icon: '💱',
    features: ['India support', 'UPI payments', 'Low fees', 'Fast KYC'],
    widgetUrl: 'https://global.transak.com',
  },
  ramp: {
    name: 'Ramp Network',
    color: 'bg-orange-500',
    icon: '🚀',
    features: ['Lowest fees', 'EU focused', 'Open banking', 'No KYC <€150'],
    widgetUrl: 'https://ramp.network/buy',
  },
};

export const FiatPurchaseWidget: React.FC<{
  nft: {
    name: string;
    image: string;
    price: string; // in EGLD
    collection: string;
  };
  walletAddress?: string;
  onSuccess?: () => void;
}> = ({ nft, walletAddress, onSuccess }) => {
  const [step, setStep] = useState<'amount' | 'quote' | 'payment'>('amount');
  const [fiatAmount, setFiatAmount] = useState<string>('');
  const [fiatCurrency, setFiatCurrency] = useState('USD');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getQuote = async () => {
    setIsLoading(true);
    try {
      // Client-side quote estimation (no backend needed)
      const amount = parseFloat(fiatAmount);
      const fee = amount * 0.0499; // ~4.99% MoonPay average
      const networkFee = amount * 0.01;
      const totalCost = amount + fee + networkFee;
      const cryptoAmount = (amount / 40) * 0.95; // Approx $40 EGLD, minus fees

      setQuote({
        provider: 'moonpay',
        fiatAmount: amount,
        fiatCurrency,
        cryptoAmount,
        cryptoCurrency: 'EGLD',
        fee,
        networkFee,
        totalCost,
      });
      setStep('quote');
    } catch (error) {
      alert('Failed to get quote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const initiatePurchase = () => {
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    setStep('payment');

    const provider = PROVIDER_INFO[quote!.provider];
    const params = new URLSearchParams({
      apiKey: process.env.REACT_APP_MOONPAY_API_KEY || '',
      baseCurrencyCode: fiatCurrency.toLowerCase(),
      baseCurrencyAmount: fiatAmount,
      currencyCode: 'egld',
      walletAddress: walletAddress,
      colorCode: '%2300d4ff',
    });

    const url = `${provider.widgetUrl}?${params.toString()}`;
    window.open(url, '_blank');
    onSuccess?.();
  };

  return (
    <div className="bg-[#0a0a0f] rounded-2xl border border-gray-800 p-6 max-w-md w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Buy with Card</h2>
          <p className="text-sm text-gray-400">Instant crypto delivery to your wallet</p>
        </div>
      </div>

      <div className="flex gap-4 p-4 bg-[#12121a] rounded-xl mb-6">
        <img src={nft.image} alt={nft.name} className="w-20 h-20 rounded-lg object-cover" />
        <div>
          <p className="font-bold text-white">{nft.name}</p>
          <p className="text-cyan-400">{nft.price} EGLD</p>
          <p className="text-xs text-gray-500">≈ ${(parseFloat(nft.price) * 40).toFixed(2)}</p>
        </div>
      </div>

      {step === 'amount' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">You pay (Fiat)</label>
            <div className="flex gap-2">
              <select
                value={fiatCurrency}
                onChange={(e) => setFiatCurrency(e.target.value)}
                className="bg-[#1a1a25] border border-gray-700 rounded-lg px-3 py-3 text-white"
              >
                <option value="USD">🇺🇸 USD</option>
                <option value="EUR">🇪🇺 EUR</option>
                <option value="GBP">🇬🇧 GBP</option>
                <option value="CAD">🇨🇦 CAD</option>
              </select>
              <input
                type="number"
                value={fiatAmount}
                onChange={(e) => setFiatAmount(e.target.value)}
                placeholder="100"
                className="flex-1 bg-[#1a1a25] border border-gray-700 rounded-lg px-4 py-3 text-white text-lg"
              />
            </div>
          </div>

          <button
            onClick={getQuote}
            disabled={!fiatAmount || parseFloat(fiatAmount) < 30 || !walletAddress}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Getting best price...' : 'Get Quote'}
          </button>

          {!walletAddress && (
            <p className="text-xs text-center text-amber-400">Connect your wallet to proceed</p>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
            <Shield className="w-4 h-4" />
            <span>Secure payments by regulated providers</span>
          </div>
        </motion.div>
      )}

      {step === 'quote' && quote && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-green-400" />
              <span className="font-bold text-green-400">Best Price Found</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-bold text-white">{quote.cryptoAmount.toFixed(4)} EGLD</p>
                <p className="text-sm text-gray-400">Will be sent to your wallet</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">${quote.totalCost.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Total cost</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('amount')} className="flex-1 py-3 border border-gray-700 rounded-xl text-gray-400 hover:text-white">
              Back
            </button>
            <button
              onClick={initiatePurchase}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold text-white"
            >
              Continue to Payment
            </button>
          </div>
        </motion.div>
      )}

      {step === 'payment' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-bold mb-2">Opening secure checkout...</p>
          <p className="text-sm text-gray-400">Complete payment in the new tab, then return to buy the NFT</p>
        </div>
      )}
    </div>
  );
};
