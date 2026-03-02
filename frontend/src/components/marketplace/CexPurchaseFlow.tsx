// components/CexPurchaseFlow.tsx
import { motion } from 'framer-motion';
import { useGetAccountInfo } from '@/hooks/sdkStubs';
import React, { useState } from 'react';
import { BinanceConnect } from './BinanceConnect';
import { SmartTokenSelector } from './SmartTokenSelector';

interface NFTForSale {
  identifier: string;
  collection: string;
  nonce: number;
  name: string;
  image: string;
  price: string;
  priceToken: string;
  seller: string;
}

export const CexPurchaseFlow: React.FC<{
  nft: NFTForSale;
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ nft, onSuccess, onCancel }) => {
  const { address } = useGetAccountInfo();
  const [step, setStep] = useState<'connect' | 'select-token' | 'confirm' | 'processing'>('connect');
  const [binanceUser, setBinanceUser] = useState<any>(null);
  const [binanceBalances, setBinanceBalances] = useState<any[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBinanceConnect = (user: any, balances: any[]) => {
    setBinanceUser(user);
    setBinanceBalances(balances);
    setStep('select-token');
  };

  const handleTokenSelect = (token: any) => {
    setSelectedToken(token.identifier);
    setStep('confirm');
  };

  const initiatePurchase = async () => {
    setIsProcessing(true);
    setStep('processing');

    try {
      // 1. Create escrow in smart contract
      const escrowResponse = await fetch('/api/cex/initiate-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cexUserId: binanceUser.userId,
          cexSource: 'binance',
          multiversxAddress: address,
          nftIdentifier: nft.identifier,
          nftNonce: nft.nonce,
          seller: nft.seller,
          paymentToken: selectedToken,
          paymentAmount: calculateRequiredAmount(nft.price, selectedToken),
        }),
      });

      const { escrowId, depositAddress } = await escrowResponse.json();

      // 2. Initiate Binance withdrawal to deposit address
      const withdrawalResponse = await fetch('/api/binance/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escrowId,
          coin: selectedToken,
          amount: calculateRequiredAmount(nft.price, selectedToken),
          address: depositAddress,
          network: 'EGLD', // MultiversX network
        }),
      });

      // 3. Poll for completion
      await pollForCompletion(escrowId);
      
      onSuccess();
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Funds will be refunded to your Binance account.');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateRequiredAmount = (price: string, token: string): string => {
    // Convert NFT price (in EGLD) to selected token amount
    // This would use live exchange rates
    return price; // Simplified
  };

  const pollForCompletion = async (escrowId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes (5s intervals)

      const check = async () => {
        attempts++;
        
        const response = await fetch(`/api/cex/escrow/${escrowId}`);
        const { status } = await response.json();

        if (status === 'Completed') {
          resolve();
        } else if (status === 'Expired' || status === 'Refunded') {
          reject(new Error('Escrow failed'));
        } else if (attempts >= maxAttempts) {
          reject(new Error('Timeout'));
        } else {
          setTimeout(check, 5000);
        }
      };

      check();
    });
  };

  return (
    <div className="bg-[#0a0a0f] rounded-2xl border border-gray-800 p-6 max-w-lg w-full">
      <h2 className="text-2xl font-bold text-white mb-6">Buy with CEX</h2>

      {/* NFT Preview */}
      <div className="flex gap-4 mb-6 p-4 bg-[#12121a] rounded-xl">
        <img src={nft.image} alt={nft.name} className="w-20 h-20 rounded-lg object-cover" />
        <div>
          <p className="font-bold text-white">{nft.name}</p>
          <p className="text-cyan-400">{nft.price} EGLD</p>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {/* Step 1: Connect Binance */}
        <div className={`p-4 rounded-xl border ${step === 'connect' ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-800'}`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-full bg-yellow-500 text-black font-bold flex items-center justify-center">1</span>
            <span className="font-bold text-white">Connect Binance</span>
          </div>
          {step === 'connect' && (
            <BinanceConnect 
              onConnect={handleBinanceConnect}
              onDisconnect={() => setStep('connect')}
            />
          )}
          {step !== 'connect' && binanceUser && (
            <p className="text-green-400 text-sm">✓ Connected as {binanceUser.email}</p>
          )}
        </div>

        {/* Step 2: Select Token */}
        <div className={`p-4 rounded-xl border ${step === 'select-token' ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-800'}`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-full bg-cyan-500 text-white font-bold flex items-center justify-center">2</span>
            <span className="font-bold text-white">Select Payment Token</span>
          </div>
          {step === 'select-token' && (
            <SmartTokenSelector
              selectedToken={selectedToken}
              onSelect={handleTokenSelect}
              defaultTier="all"
              cexBalances={binanceBalances}
            />
          )}
          {step === 'confirm' && selectedToken && (
            <p className="text-green-400 text-sm">✓ Paying with {selectedToken}</p>
          )}
        </div>

        {/* Step 3: Confirm */}
        {step === 'confirm' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl border border-purple-500 bg-purple-500/10"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-8 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center">3</span>
              <span className="font-bold text-white">Confirm Purchase</span>
            </div>
            
            <div className="space-y-3 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">NFT</span>
                <span className="text-white">{nft.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Price</span>
                <span className="text-white">{nft.price} EGLD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment</span>
                <span className="text-white">{selectedToken}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Receiving Address</span>
                <span className="text-cyan-400 font-mono text-xs">{address?.slice(0, 10)}...{address?.slice(-6)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 border border-gray-700 rounded-xl text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={initiatePurchase}
                className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl font-bold text-black"
              >
                Confirm Purchase
              </button>
            </div>
          </motion.div>
        )}

        {/* Processing */}
        {step === 'processing' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-bold mb-2">Processing CEX Withdrawal</p>
            <p className="text-sm text-gray-400">
              Please confirm the withdrawal in your Binance app/email.
              This may take 2-5 minutes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
