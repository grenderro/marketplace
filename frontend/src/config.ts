// config.ts — MultiversX Marketplace Configuration (Decentralized)
// No backend dependencies. All data comes from the MultiversX blockchain or IPFS.

export const DAPP_CONFIG = {
  environment: 'devnet' as const, // 'devnet', 'testnet', or 'mainnet'
};

// Your Smart Contract Address (Devnet)
export const CONTRACT_ADDRESS =
  process.env.REACT_APP_CONTRACT_ADDRESS ||
  'erd1qqqqqqqqqqqqqpgqmzpauhqppu707208j8zrjq8q7trpgw7yvhuqtjt9ev';

// MultiversX Network Endpoints
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

export const ACTIVE_NETWORK = NETWORK_CONFIG[DAPP_CONFIG.environment];

export const API_URL = ACTIVE_NETWORK.apiAddress;
export const GATEWAY_URL = ACTIVE_NETWORK.gatewayAddress;
export const CHAIN_ID = ACTIVE_NETWORK.chainId;
export const BLOCKCHAIN_EXPLORER = ACTIVE_NETWORK.explorerAddress;
export const WALLET_URL = ACTIVE_NETWORK.walletAddress;

// IPFS Configuration
export const IPFS_CONFIG = {
  gateway: 'https://ipfs.io/ipfs/',
  uploadGateway: 'https://api.pinata.cloud',
};

// Marketplace Constants
export const MARKETPLACE_CONFIG = {
  gasLimits: {
    createListing: 10000000,
    buyListing: 10000000,
    cancelListing: 10000000,
    createAuction: 15000000,
    placeBid: 10000000,
    createCollection: 50000000,
    mintNFT: 20000000,
  },
  fees: {
    marketplaceFee: 2,
    royaltyMax: 10,
  },
  itemsPerPage: 24,
  auction: {
    minDuration: 3600,
    maxDuration: 2592000,
  },
};

export const TOKENS = {
  EGLD: 'EGLD',
  USDC: 'USDC-350c4e',
};

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

export default {
  DAPP_CONFIG,
  CONTRACT_ADDRESS,
  NETWORK_CONFIG,
  ACTIVE_NETWORK,
  API_URL,
  GATEWAY_URL,
  CHAIN_ID,
  BLOCKCHAIN_EXPLORER,
  IPFS_CONFIG,
  MARKETPLACE_CONFIG,
  TOKENS,
  getExplorerLink,
};
