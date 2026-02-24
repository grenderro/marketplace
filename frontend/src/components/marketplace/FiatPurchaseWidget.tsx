// components/FiatPurchaseWidget.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Wallet, ChevronDown, Info, Shield, Zap } from 'lucide-react';

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

const PROVIDER_INFO: Record<string, { name: string; color: string; icon: string; features: string[] }> = {
  moonpay: {
    name: 'MoonPay',
    color: 'bg-purple-500',
    icon: '🌙',
    features: ['160+ countries', 'Apple Pay', 'Google Pay', 'Bank transfer'],
  },
  transak: {
    name: 'Transak',
    color: 'bg-blue-500',
    icon: '💱',
    features: ['India support', 'UPI payments', 'Low fees', 'Fast KYC'],
  },
  ramp: {
    name: 'Ramp Network',
    color: 'bg-orange-500',
    icon: '🚀',
    features: ['Lowest fees', 'EU focused', 'Open banking', 'No KYC <€150'],
  },
  binancepay: {
    name: 'Binance Pay',
    color: 'bg-yellow-500',
    icon: '💛',
    features: ['0% fees', 'Instant', 'Binance balance', 'Crypto cashback'],
  },
};

export const FiatPurchaseWidget: React.FC<{
  nft: {
    name: string;
    image: string;
    price: string; // in EGLD
    collection: string;
  };
  onSuccess: () => void;
}> = ({ nft, onSuccess }) => {
  const [step, setStep] = useState<'amount' | 'quote' | 'payment' | 'processing'>('amount');
  const [fiatAmount, setFiatAmount] = useState<string>('');
  const [fiatCurrency, setFiatCurrency] = useState('USD');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [multiversxAddress, setMultiversxAddress] = useState('');

  const getQuote = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/fiat/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fiatCurrency,
          fiatAmount: parseFloat(fiatAmount),
          cryptoCurrency: 'EGLD',
        }),
      });

      const data = await response.json();
      setQuote(data);
      setStep('quote');
    } catch (error) {
      alert('Failed to get quote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const initiatePurchase = async () => {
    setIsLoading(true);
    setStep('payment');

    try {
      // 1. Create escrow in smart contract
      const escrowResponse = await fetch('/api/fiat/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: quote!.provider,
          fiatAmount: parseFloat(fiatAmount) * 100, // Convert to cents
          fiatCurrency,
          cryptoCurrency: 'EGLD',
          multiversxAddress,
          email,
          nftIdentifier: nft.collection, // Simplified
        }),
      });

      const { escrowId } = await escrowResponse.json();

      // 2. Create fiat transaction
      const txResponse = await fetch('/api/fiat/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: quote!.provider,
          escrowId,
          fiatCurrency,
          fiatAmount: parseFloat(fiatAmount),
          cryptoCurrency: 'EGLD',
          cryptoAmount: quote!.cryptoAmount,
          walletAddress: multiversxAddress,
          email,
        }),
      });

      const { checkoutUrl, widgetUrl } = await txResponse.json();

      // 3. Redirect to payment
      window.location.href = checkoutUrl || widgetUrl!;
    } catch (error) {
      alert('Failed to initiate purchase');
      setStep('quote');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0a0f] rounded-2xl border border-gray-800 p-6 max-w-md w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Buy with Card</h2>
          <p className="text-sm text-gray-400">Instant crypto delivery</p>
        </div>
      </div>

      {/* NFT Preview */}
      <div className="flex gap-4 p-4 bg-[#12121a] rounded-xl mb-6">
        <img src={nft.image} alt={nft.name} className="w-20 h-20 rounded-lg object-cover" />
        <div>
          <p className="font-bold text-white">{nft.name}</p>
          <p className="text-cyan-400">{nft.price} EGLD</p>
          <p className="text-xs text-gray-500">≈ ${(parseFloat(nft.price) * 40).toFixed(2)}</p>
        </div>
      </div>

      {/* Step 1: Amount */}
      {step === 'amount' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              You pay (Fiat)
            </label>
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
                <option value="AUD">🇦🇺 AUD</option>
                <option value="JPY">🇯🇵 JPY</option>
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

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Your MultiversX Address
            </label>
            <input
              type="text"
              value={multiversxAddress}
              onChange={(e) => setMultiversxAddress(e.target.value)}
              placeholder="erd1..."
              className="w-full bg-[#1a1a25] border border-gray-700 rounded-lg px-4 py-3 text-white font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Email (for receipt)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#1a1a25] border border-gray-700 rounded-lg px-4 py-3 text-white"
            />
          </div>

          <button
            onClick={getQuote}
            disabled={!fiatAmount || parseFloat(fiatAmount) < 30 || !multiversxAddress || !email}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Getting best price...
              </span>
            ) : (
              'Get Quote'
            )}
          </button>

          <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
            <Shield className="w-4 h-4" />
            <span>Secure payments by regulated providers</span>
          </div>
        </motion.div>
      )}

      {/* Step 2: Quote Comparison */}
      {step === 'quote' && quote && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
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

          {/* Provider Info */}
          <div className="p-4 bg-[#12121a] rounded-xl border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full ${PROVIDER_INFO[quote.provider].color} flex items-center justify-center text-xl`}>
                {PROVIDER_INFO[quote.provider].icon}
              </div>
              <div>
                <p className="font-bold text-white">{PROVIDER_INFO[quote.provider].name}</p>
                <p className="text-xs text-green-400">Recommended</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {PROVIDER_INFO[quote.provider].features.map((feature) => (
                <span key={feature} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>NFT Price</span>
              <span>${(parseFloat(nft.price) * 40).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Provider Fee</span>
              <span>${quote.fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Network Fee</span>
              <span>${quote.networkFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white font-bold pt-2 border-t border-gray-800">
              <span>Total</span>
              <span>${quote.totalCost.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('amount')}
              className="flex-1 py-3 border border-gray-700 rounded-xl text-gray-400 hover:text-white"
            >
              Back
            </button>
            <button
              onClick={initiatePurchase}
              disabled={isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold text-white"
            >
              {isLoading ? 'Processing...' : 'Continue to Payment'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Processing */}
      {step === 'payment' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-bold mb-2">Preparing Checkout...</p>
          <p className="text-sm text-gray-400">Redirecting to secure payment provider</p>
        </div>
      )}
    </div>
  );
};
