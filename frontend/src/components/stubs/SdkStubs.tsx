// Quick fixes for missing SDK imports
export const useGetAccountInfo = () => ({ address: '' });
export const useGetNetworkConfig = () => ({ 
  network: { 
    apiAddress: 'https://devnet-api.multiversx.com', 
    chainId: 'D' 
  } 
});
