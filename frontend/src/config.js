export const DAPP_CONFIG = {
  environment: 'devnet', // 'devnet', 'testnet', or 'mainnet'
};

export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || 
  'erd1qqqqqqqqqqqqqpgqmzpauhqppu707208j8zrjq8q7trpgw7yvhuqtjt9ev';

export const API_URL = 'http://localhost:3001/api';
export const WS_URL = 'ws://localhost:3001';
