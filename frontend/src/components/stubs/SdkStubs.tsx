import React, { createContext, useContext, useCallback } from 'react';
import {
  useGetLoginInfo as realUseGetLoginInfo,
  useGetAccountInfo as realUseGetAccountInfo,
  useGetNetworkConfig as realUseGetNetworkConfig,
  useExtensionLogin as realUseExtensionLogin,
  useWebWalletLogin as realUseWebWalletLogin,
  useLedgerLogin as realUseLedgerLogin,
  useWalletConnectV2Login as realUseWalletConnectV2Login
} from '@multiversx/sdk-dapp/hooks';
import { logout as sdkLogout } from '@multiversx/sdk-dapp/utils';

// Re-export raw hooks for components that need them directly
export const useGetLoginInfo = realUseGetLoginInfo;
export const useGetAccountInfo = realUseGetAccountInfo;
export const useGetNetworkConfig = realUseGetNetworkConfig;

export interface WalletContextType {
  address: string | null;
  isAuthenticated: boolean;
  accountBalance: string;
  formattedBalance: string;
  nonce: number;
  login: (providerType: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  account: any;
  isLoggedIn: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = realUseGetLoginInfo();
  const { address, account } = realUseGetAccountInfo();

  // IMPORTANT: With HashRouter, the server only serves the root HTML file.
  // The actual route lives in window.location.hash. The web wallet redirect
  // must come back to '/' so the SPA loads and sdk-dapp can read the
  // query parameters and restore the session.
  const callbackRoute = '/';

  // Initialize login hooks ONCE at the provider level.
  // Never call these inside individual components or page hooks.
  const [initExtensionLogin] = realUseExtensionLogin({ callbackRoute, nativeAuth: false });
  const [initWebWalletLogin] = realUseWebWalletLogin({ callbackRoute, nativeAuth: false });
  const [initLedgerLogin] = realUseLedgerLogin({ callbackRoute, nativeAuth: false });
  const [initWalletConnectLogin] = realUseWalletConnectV2Login({
    callbackRoute,
    logoutRoute: '/',
    nativeAuth: false,
  });

  const login = useCallback(async (providerType: string) => {
    switch (providerType) {
      case 'extension':
        await initExtensionLogin();
        break;
      case 'web':
        await initWebWalletLogin();
        break;
      case 'ledger':
        await initLedgerLogin();
        break;
      case 'mobile':
      case 'xportal':
        await initWalletConnectLogin();
        break;
      default:
        console.warn('Unknown provider:', providerType);
    }
  }, [initExtensionLogin, initWebWalletLogin, initLedgerLogin, initWalletConnectLogin]);

  const logout = useCallback(() => {
    sdkLogout(callbackRoute);
  }, []);

  const value: WalletContextType = {
    address: address || null,
    isAuthenticated: isLoggedIn,
    accountBalance: account?.balance || '0',
    formattedBalance: account?.balance ? (parseInt(account.balance) / 1e18).toFixed(4) : '0',
    nonce: account?.nonce || 0,
    login,
    logout,
    error: null,
    account,
    isLoggedIn
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useSdk = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useSdk must be used within a WalletProvider');
  }
  return context;
};

// UI Components
export const Spinner: React.FC = () => <div>Loading...</div>;
export const LoadingState: React.FC = () => <div>Loading...</div>;
export const EmptyState: React.FC<any> = ({ message = 'No items found' }) => <div>{message}</div>;
export const TokenList: React.FC<any> = ({ tokens }) => (
  <div>{tokens?.map((t: any) => <div key={t.identifier}>{t.name}</div>)}</div>
);
export const LeaderboardPreview: React.FC<any> = ({ competitionId }) => (
  <div>Leaderboard {competitionId}</div>
);

export default useSdk;
