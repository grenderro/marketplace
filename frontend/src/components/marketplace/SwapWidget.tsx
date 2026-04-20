// components/marketplace/SwapWidget.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownUp,
  Settings,
  X,
  ChevronDown,
  AlertTriangle,
  Loader2,
  Check,
  Info,
  Wallet,
} from 'lucide-react';
import { useGetAccountInfo } from '../../hooks/sdkStubs';

// ─── Types ─────────────────────────────────────────────────
interface Token {
  id: string;
  ticker: string;
  name: string;
  price: number;
  decimals: number;
  logo?: string;
}

const TOKENS: Token[] = [
  { id: 'egld', ticker: 'EGLD', name: 'MultiversX', price: 42.5, decimals: 18 },
  { id: 'wegld', ticker: 'WEGLD', name: 'Wrapped EGLD', price: 42.5, decimals: 18 },
  { id: 'usdc', ticker: 'USDC', name: 'USD Coin', price: 1.0, decimals: 6 },
  { id: 'lkmex', ticker: 'LKMEX', name: 'Locked MEX', price: 0.0002, decimals: 18 },
  { id: 'ride', ticker: 'RIDE', name: 'Holoride', price: 0.05, decimals: 18 },
  { id: 'itheum', ticker: 'ITHEUM', name: 'Itheum', price: 0.08, decimals: 18 },
  { id: 'zpay', ticker: 'ZPAY', name: 'ZoidPay', price: 0.12, decimals: 18 },
  { id: 'crt', ticker: 'CRT', name: 'Cantina Royale', price: 0.003, decimals: 18 },
];

// ─── Helpers ───────────────────────────────────────────────
const formatAmount = (value: string, decimals: number): string => {
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US', { maximumFractionDigits: decimals });
};

const calculateOutput = (inputAmount: string, inputToken: Token, outputToken: Token): string => {
  const amount = parseFloat(inputAmount);
  if (isNaN(amount) || amount <= 0) return '';
  const outputValue = (amount * inputToken.price) / outputToken.price;
  return outputValue.toFixed(6);
};

const calculatePriceImpact = (inputAmount: string, inputToken: Token, outputToken: Token): number => {
  const amount = parseFloat(inputAmount);
  if (isNaN(amount) || amount <= 0) return 0;
  // Simplified: larger trades have higher impact
  const tradeValue = amount * inputToken.price;
  if (tradeValue < 100) return 0.1;
  if (tradeValue < 1000) return 0.5;
  if (tradeValue < 5000) return 1.2;
  if (tradeValue < 10000) return 2.5;
  return 5.0;
};

// ─── Component ─────────────────────────────────────────────
interface SwapWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedToken?: string; // ticker
}

export const SwapWidget: React.FC<SwapWidgetProps> = ({
  isOpen,
  onClose,
  preselectedToken,
}) => {
  const { address, account } = useGetAccountInfo();

  const [fromToken, setFromToken] = useState<Token>(TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(
    TOKENS.find((t) => t.ticker === (preselectedToken || 'USDC')) || TOKENS[2]
  );
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [showTokenSelect, setShowTokenSelect] = useState<'from' | 'to' | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(false);

  const walletBalance = useMemo(() => {
    if (!account?.balance) return 0;
    return parseInt(account.balance) / 1e18;
  }, [account]);

  const priceImpact = useMemo(
    () => calculatePriceImpact(fromAmount, fromToken, toToken),
    [fromAmount, fromToken, toToken]
  );

  const minimumReceived = useMemo(() => {
    const output = parseFloat(toAmount);
    if (isNaN(output)) return 0;
    return output * (1 - slippage / 100);
  }, [toAmount, slippage]);

  const exchangeRate = useMemo(() => {
    if (fromToken.price === 0) return 0;
    return (toToken.price / fromToken.price).toFixed(6);
  }, [fromToken, toToken]);

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    const output = calculateOutput(value, fromToken, toToken);
    setToAmount(output);
  };

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleSelectToken = (token: Token, side: 'from' | 'to') => {
    if (side === 'from') {
      if (token.id === toToken.id) {
        setToToken(fromToken);
      }
      setFromToken(token);
    } else {
      if (token.id === fromToken.id) {
        setFromToken(toToken);
      }
      setToToken(token);
    }
    setShowTokenSelect(null);
    // Recalculate
    const output = calculateOutput(fromAmount, side === 'from' ? token : fromToken, side === 'to' ? token : toToken);
    setToAmount(output);
  };

  const handleSwap = async () => {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }
    const amount = parseFloat(fromAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsSwapping(true);
    // Simulate transaction delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSwapping(false);
    setSwapSuccess(true);
    setTimeout(() => {
      setSwapSuccess(false);
      setFromAmount('');
      setToAmount('');
    }, 3000);
  };

  const isHighImpact = priceImpact > 3;
  const isMediumImpact = priceImpact > 1 && priceImpact <= 3;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#12121a] rounded-2xl border border-gray-800 w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <ArrowDownUp className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Swap Tokens</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${
                  showSettings ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-gray-800"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Slippage Tolerance</span>
                    <div className="flex gap-2">
                      {[0.1, 0.5, 1.0].map((s) => (
                        <button
                          key={s}
                          onClick={() => setSlippage(s)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            slippage === s
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              : 'bg-gray-800 text-gray-400 border border-transparent'
                          }`}
                        >
                          {s}%
                        </button>
                      ))}
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded-lg">
                        <input
                          type="number"
                          value={slippage}
                          onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
                          className="w-10 bg-transparent text-white text-xs text-right outline-none"
                        />
                        <span className="text-gray-500 text-xs">%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Transaction Deadline</span>
                    <span className="text-gray-400">20 minutes</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Swap Body */}
          <div className="p-5 space-y-3">
            {/* From Token */}
            <div className="bg-[#1a1a25] rounded-xl p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">From</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Wallet className="w-3 h-3" />
                  Balance:{' '}
                  <span className="text-gray-300">
                    {fromToken.ticker === 'EGLD'
                      ? walletBalance.toFixed(4)
                      : '0.0000'}
                  </span>{' '}
                  {fromToken.ticker}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  className="flex-1 bg-transparent text-2xl font-bold text-white outline-none placeholder:text-gray-600"
                />
                <TokenButton token={fromToken} onClick={() => setShowTokenSelect('from')} />
              </div>
              <div className="text-right mt-1">
                <span className="text-xs text-gray-600">
                  ~${(parseFloat(fromAmount || '0') * fromToken.price).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Swap Direction Button */}
            <div className="flex justify-center -my-2 relative z-10">
              <button
                onClick={handleSwapTokens}
                className="w-10 h-10 rounded-xl bg-[#1a1a25] border border-gray-700 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all"
              >
                <ArrowDownUp className="w-5 h-5" />
              </button>
            </div>

            {/* To Token */}
            <div className="bg-[#1a1a25] rounded-xl p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">To (estimated)</span>
                <span className="text-xs text-gray-500">
                  Balance: <span className="text-gray-300">0.0000</span> {toToken.ticker}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="0.0"
                  value={toAmount}
                  readOnly
                  className="flex-1 bg-transparent text-2xl font-bold text-white outline-none placeholder:text-gray-600"
                />
                <TokenButton token={toToken} onClick={() => setShowTokenSelect('to')} />
              </div>
              <div className="text-right mt-1">
                <span className="text-xs text-gray-600">
                  ~${(parseFloat(toAmount || '0') * toToken.price).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Rate & Details */}
            {fromAmount && parseFloat(fromAmount) > 0 && (
              <div className="bg-white/5 rounded-xl p-4 space-y-2 border border-white/5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Exchange Rate</span>
                  <span className="text-gray-300">
                    1 {fromToken.ticker} ≈ {exchangeRate} {toToken.ticker}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Price Impact</span>
                  <span
                    className={`font-medium ${
                      isHighImpact ? 'text-red-400' : isMediumImpact ? 'text-yellow-400' : 'text-green-400'
                    }`}
                  >
                    {priceImpact < 0.01 ? '< 0.01%' : `${priceImpact.toFixed(2)}%`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    Min. Received <Info className="w-3 h-3" />
                  </span>
                  <span className="text-gray-300">
                    {minimumReceived.toFixed(6)} {toToken.ticker}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Network Fee</span>
                  <span className="text-gray-300">~0.001 EGLD</span>
                </div>

                {isHighImpact && (
                  <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg mt-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="text-xs text-red-400">
                      High price impact! Consider splitting your trade into smaller amounts.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              disabled={
                isSwapping ||
                swapSuccess ||
                !fromAmount ||
                parseFloat(fromAmount) <= 0 ||
                !address
              }
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                swapSuccess
                  ? 'bg-green-500 text-white'
                  : isHighImpact
                  ? 'bg-red-500 hover:bg-red-400 text-white disabled:opacity-50'
                  : 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50'
              }`}
            >
              {isSwapping ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Swapping...
                </>
              ) : swapSuccess ? (
                <>
                  <Check className="w-5 h-5" /> Swap Successful!
                </>
              ) : !address ? (
                'Connect Wallet'
              ) : isHighImpact ? (
                'Swap Anyway'
              ) : (
                'Swap'
              )}
            </button>
          </div>
        </motion.div>

        {/* Token Selector Modal */}
        <AnimatePresence>
          {showTokenSelect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowTokenSelect(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-[#1a1a25] rounded-2xl border border-gray-700 w-full max-w-sm overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <h3 className="text-white font-bold">Select Token</h3>
                  <button
                    onClick={() => setShowTokenSelect(null)}
                    className="p-1 text-gray-500 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-2 max-h-80 overflow-y-auto">
                  {TOKENS.map((token) => (
                    <button
                      key={token.id}
                      onClick={() => handleSelectToken(token, showTokenSelect)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        (showTokenSelect === 'from' && token.id === fromToken.id) ||
                        (showTokenSelect === 'to' && token.id === toToken.id)
                          ? 'bg-cyan-500/10'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                        {token.ticker[0]}
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-white font-medium">{token.ticker}</p>
                        <p className="text-xs text-gray-500">{token.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm">${token.price}</p>
                        <p className="text-xs text-gray-600">per token</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Subcomponents ─────────────────────────────────────────

const TokenButton: React.FC<{ token: Token; onClick: () => void }> = ({ token, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors shrink-0"
  >
    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-bold text-xs">
      {token.ticker[0]}
    </div>
    <span className="text-white font-bold text-sm">{token.ticker}</span>
    <ChevronDown className="w-4 h-4 text-gray-500" />
  </button>
);

export default SwapWidget;
