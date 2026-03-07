// config.ts - MultiversX Marketplace Configuration

// Network Configuration
export const DAPP_CONFIG = {
  environment: 'devnet' as const, // 'devnet', 'testnet', or 'mainnet'
};

// Your Smart Contract Address (Devnet)
export const CONTRACT_ADDRESS = 
  process.env.REACT_APP_CONTRACT_ADDRESS || 
  'erd1qqqqqqqqqqqqqpgqmzpauhqppu707208j8zrjq8q7trpgw7yvhuqtjt9ev';

// MultiversX Network Endpoints (Devnet)
export const NETWORK_CONFIG = {
  devnet: {
    id: 'devnet',
    chainId: 'D',
    apiAddress: 'https://devnet-api.multiversx.com',
    gatewayAddress: 'https://devnet-gateway.multiversx.com',
    explorerAddress: 'https://devnet-explorer.multiversx.com',
    walletAddress: 'https://devnet-wallet.multiversx.com',
  },
  testnet: {
    id: 'testnet',
    chainId: 'T',
    apiAddress: 'https://testnet-api.multiversx.com',
    gatewayAddress: 'https://testnet-gateway.multiversx.com',
    explorerAddress: 'https://testnet-explorer.multiversx.com',
    walletAddress: 'https://testnet-wallet.multiversx.com',
  },
  mainnet: {
    id: 'mainnet',
    chainId: '1',
    apiAddress: 'https://api.multiversx.com',
    gatewayAddress: 'https://gateway.multiversx.com',
    explorerAddress: 'https://explorer.multiversx.com',
    walletAddress: 'https://wallet.multiversx.com',
  },
};

// Active Network (based on DAPP_CONFIG)
export const ACTIVE_NETWORK = NETWORK_CONFIG[DAPP_CONFIG.environment];

// Blockchain-specific exports
export const API_URL = ACTIVE_NETWORK.apiAddress;
export const GATEWAY_URL = ACTIVE_NETWORK.gatewayAddress;
export const CHAIN_ID = ACTIVE_NETWORK.chainId;
export const BLOCKCHAIN_EXPLORER = ACTIVE_NETWORK.explorerAddress;
export const WALLET_URL = ACTIVE_NETWORK.walletAddress;

// Backend API Configuration (Your Node.js API)
export const BACKEND_API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001/api';
export const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';

// IPFS Configuration (for NFT metadata)
export const IPFS_CONFIG = {
  gateway: 'https://ipfs.io/ipfs/',
  uploadGateway: 'https://api.pinata.cloud', // or your preferred IPFS service
};

// Marketplace-specific Constants
export const MARKETPLACE_CONFIG = {
  // Transaction gas limits
  gasLimits: {
    createListing: 10000000,
    buyListing: 10000000,
    cancelListing: 10000000,
    createAuction: 15000000,
    placeBid: 10000000,
    createCollection: 50000000,
    mintNFT: 20000000,
  },
  
  // Fees (in percentage)
  fees: {
    marketplaceFee: 2, // 2%
    royaltyMax: 10,    // 10% max royalty
  },
  
  // Pagination
  itemsPerPage: 24,
  
  // Auction settings
  auction: {
    minDuration: 3600,    // 1 hour in seconds
    maxDuration: 2592000, // 30 days in seconds
  },
};

// Token identifiers (Devnet)
export const TOKENS = {
  EGLD: 'EGLD',
  // Add other ESDT tokens you support
  USDC: 'USDC-350c4e', // Example devnet USDC
};

// Helper function to get explorer links
export const getExplorerLink = (type: 'address' | 'transaction' | 'token', value: string) => {
  const base = BLOCKCHAIN_EXPLORER;
  switch (type) {
    case 'address':
      return `${base}/accounts/${value}`;
    case 'transaction':
      return `${base}/transactions/${value}`;
    case 'token':
      return `${base}/tokens/${value}`;
    default:
      return base;
  }
};

// Export default for convenience
export default {
  DAPP_CONFIG,
  CONTRACT_ADDRESS,
  NETWORK_CONFIG,
  ACTIVE_NETWORK,
  API_URL,
  GATEWAY_URL,
  CHAIN_ID,
  BLOCKCHAIN_EXPLORER,
  BACKEND_API_URL,
  WS_URL,
  IPFS_CONFIG,
  MARKETPLACE_CONFIG,
  TOKENS,
  getExplorerLink,
};
