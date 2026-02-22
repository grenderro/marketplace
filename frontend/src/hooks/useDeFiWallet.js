import { useState, useEffect } from 'react';

const WALLET_URL = 'https://devnet-wallet.multiversx.com';

export const useDeFiWallet = () => {
  const [account, setAccount] = useState(() => {
    return localStorage.getItem('mx_address') || null;
  });
  const [isConnected, setIsConnected] = useState(() => {
    return !!localStorage.getItem('mx_address');
  });

  useEffect(() => {
    // Check URL for address parameter (wallet redirects back with ?address=...)
    const params = new URLSearchParams(window.location.search);
    const address = params.get('address');
    
    if (address) {
      console.log('Address from URL:', address);
      localStorage.setItem('mx_address', address);
      setAccount(address);
      setIsConnected(true);
      // Clean URL without reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const connect = () => {
    // Current URL as callback
    const currentUrl = window.location.href.split('?')[0]; // Remove any existing params
    const callbackUrl = encodeURIComponent(currentUrl);
    
    // Build auth URL
    const authUrl = `${WALLET_URL}/hook/login?callbackUrl=${callbackUrl}`;
    
    console.log('Opening wallet:', authUrl);
    
    // Open in same window for better callback handling
    window.location.href = authUrl;
    
    return { success: true };
  };

  const disconnect = () => {
    localStorage.removeItem('mx_address');
    setAccount(null);
    setIsConnected(false);
  };

  // Manual set address (for testing)
  const setManualAddress = (address) => {
    localStorage.setItem('mx_address', address);
    setAccount(address);
    setIsConnected(true);
  };

  return {
    account,
    isConnected,
    isInstalled: true,
    connect,
    disconnect,
    setManualAddress
  };
};
