// hooks/sdkStubs.ts
import { useSdk } from '../components/stubs/SdkStubs';

// Re-export useSdk from main stubs
export { useSdk } from '../components/stubs/SdkStubs';

// Local implementations for hooks that components expect
export const useGetAccountInfo = () => ({ 
  address: localStorage.getItem('wallet_address') || '',
  account: { 
    balance: '1000000000000000000', // 1 EGLD stub
    nonce: 0 
  } 
});

export const useGetLoginInfo = () => ({ 
  isLoggedIn: !!localStorage.getItem('wallet_address') 
});

export const useGetNetworkConfig = () => ({
  network: {
    apiAddress: 'https://devnet-api.multiversx.com',
    chainId: 'D'
  }
});

// Optional: Network provider hook
export const useGetNetworkProvider = () => ({
  provider: null // Stub for actual network provider
});

export default {
  useSdk,
  useGetAccountInfo,
  useGetLoginInfo,
  useGetNetworkConfig
};
