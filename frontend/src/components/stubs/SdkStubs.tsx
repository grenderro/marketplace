import React from 'react';
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

export const useSdk = (): WalletContextType => {
  const { isLoggedIn } = realUseGetLoginInfo();
  const { address, account } = realUseGetAccountInfo();
  
  const callbackRoute = `${window.location.pathname}${window.location.hash}`;
  const loginConfig = { callbackRoute };
  
  // Initialize hooks with config
  const [initExtensionLogin] = realUseExtensionLogin(loginConfig);
  const [initWebWalletLogin] = realUseWebWalletLogin(loginConfig);
  const [initLedgerLogin] = realUseLedgerLogin(loginConfig);
  const [initWalletConnectLogin] = realUseWalletConnectV2Login({
    ...loginConfig,
    logoutRoute: '/'
  });

  const login = async (providerType: string) => {
    switch (providerType) {
      case 'extension':
        // InitiateLoginFunctionType takes no arguments
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
    }
  };

  const logout = () => {
    sdkLogout(callbackRoute);
  };

  return {
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
