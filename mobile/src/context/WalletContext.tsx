// mobile/context/WalletContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { WalletConnectProvider } from '@multiversx/sdk-wallet-connect-provider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

interface WalletContextType {
  address: string | null;
  balance: string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (tx: any) => Promise<any>;
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [provider, setProvider] = useState<WalletConnectProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const bridge = 'https://bridge.walletconnect.org';
      const wcProvider = new WalletConnectProvider(
        bridge,
        {
          onClientLogin: async () => {
            const addr = await wcProvider.getAddress();
            setAddress(addr);
            await AsyncStorage.setItem('wallet_address', addr);
            await fetchBalance(addr);
          },
          onClientLogout: () => {
            setAddress(null);
            AsyncStorage.removeItem('wallet_address');
          },
        }
      );

      const uri = await wcProvider.login();
      
      // Open xPortal app
      const xPortalUrl = `xportal://wc?uri=${encodeURIComponent(uri)}`;
      await Linking.openURL(xPortalUrl);
      
      // Fallback to QR if app not installed
      const supported = await Linking.canOpenURL(xPortalUrl);
      if (!supported) {
        // Show QR code modal
      }

      setProvider(wcProvider);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await provider?.logout();
    setAddress(null);
    setProvider(null);
  }, [provider]);

  const signTransaction = useCallback(async (transaction: any) => {
    if (!provider) throw new Error('Wallet not connected');
    return await provider.signTransaction(transaction);
  }, [provider]);

  const fetchBalance = async (addr: string) => {
    const response = await fetch(
      `https://api.multiversx.com/accounts/${addr}`
    );
    const data = await response.json();
    setBalance((data.balance / 1e18).toFixed(4));
  };

  return (
    <WalletContext.Provider value={{
      address,
      balance,
      connect,
      disconnect,
      signTransaction,
      isConnecting,
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
};
