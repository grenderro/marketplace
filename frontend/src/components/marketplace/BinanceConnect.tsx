// components/BinanceConnect.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface BinanceUser {
  userId: string;
  email: string;
  kycStatus: string;
}

interface BinanceBalance {
  asset: string;
  free: string;
  locked: string;
  btcValue: string;
}

export const BinanceConnect: React.FC<{
  onConnect: (user: BinanceUser, balances: BinanceBalance[]) => void;
  onDisconnect: () => void;
}> = ({ onConnect, onDisconnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<BinanceUser | null>(null);
  const [balances, setBalances] = useState<BinanceBalance[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && state) {
      handleAuthCallback(code, state);
    }
  }, [searchParams]);

  const initiateConnection = () => {
    setIsConnecting(true);
    
    // Generate state for CSRF protection
    const state = crypto.randomUUID();
    localStorage.setItem('binance_oauth_state', state);

    // Open Binance Connect
    const authUrl = `/api/auth/binance?state=${state}`;
    window.location.href = authUrl;
  };

  const handleAuthCallback = async (code: string, state: string) => {
    const savedState = localStorage.getItem('binance_oauth_state');
    
    if (state !== savedState) {
      console.error('Invalid state');
      return;
    }

    try {
      const response = await fetch('/api/auth/binance/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state }),
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setBalances(data.balances);
        setIsConnected(true);
        onConnect(data.user, data.balances);
        
        // Clear URL params
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch (error) {
      console.error('Auth failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    localStorage.removeItem('binance_access_token');
    setIsConnected(false);
    setUser(null);
    setBalances([]);
    onDisconnect();
  };

  if (isConnected && user) {
    return (
      <div className="bg-[#12121a] rounded-xl p-4 border border-yellow-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-lg">B</span>
            </div>
            <div>
              <p className="font-bold text-white">Binance Connected</p>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={disconnect}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Disconnect
          </button>
        </div>

        {/* Balances */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <p className="text-sm text-gray-500 mb-2">Available for trading:</p>
          {balances
            .filter(b => parseFloat(b.free) > 0)
            .sort((a, b) => parseFloat(b.btcValue) - parseFloat(a.btcValue))
            .map((balance) => (
              <div
                key={balance.asset}
                className="flex justify-between items-center p-2 bg-[#1a1a25] rounded-lg"
              >
                <span className="font-medium text-white">{balance.asset}</span>
                <div className="text-right">
                  <p className="text-white">{parseFloat(balance.free).toFixed(4)}</p>
                  <p className="text-xs text-gray-500">≈ {parseFloat(balance.btcValue).toFixed(6)} BTC</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={initiateConnection}
      disabled={isConnecting}
      className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl font-bold text-black hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all disabled:opacity-50"
    >
      {isConnecting ? (
        <>
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          Connecting to Binance...
        </>
      ) : (
        <>
          <svg className="w-6 h-6" viewBox="0 0 32 32" fill="currentColor">
            <path d="M16 0L12.6 3.4L21.2 12L16 17.2L3.4 4.6L0 8L12.6 20.6L16 24L19.4 20.6L28 12L16 0Z"/>
            <path d="M16 32L19.4 28.6L10.8 20L16 14.8L28.6 27.4L32 24L19.4 11.4L16 8L12.6 11.4L4 20L16 32Z"/>
          </svg>
          Connect Binance Account
        </>
      )}
    </motion.button>
  );
};
