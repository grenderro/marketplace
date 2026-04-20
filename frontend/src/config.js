export const DAPP_CONFIG = {
  environment: 'devnet', // 'devnet', 'testnet', or 'mainnet'
};

export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || 
  'erd1qqqqqqqqqqqqqpgqmzpauhqppu707208j8zrjq8q7trpgw7yvhuqtjt9ev';

// No backend required — frontend queries blockchain directly
export const API_URL = 'https://devnet-api.multiversx.com';
export const WS_URL = '';
