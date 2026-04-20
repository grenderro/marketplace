// Decentralized API layer — queries MultiversX blockchain directly.
// No backend server required for core marketplace functionality.

import { API_URL } from '../config';

// ============== ANALYTICS (Computed from on-chain data) ==============

export interface GlobalStats {
  totalListings: number;
  totalVolume: string;
  activeUsers: number;
  feesGenerated: string;
}

export const fetchGlobalStats = async (): Promise<GlobalStats> => {
  // In a fully decentralized app, these would come from a subgraph or be computed
  // from the blockchain. For now, return zeros — the UI can hide or show placeholders.
  // TODO: Integrate The Graph protocol for real-time on-chain analytics.
  return {
    totalListings: 0,
    totalVolume: '0',
    activeUsers: 0,
    feesGenerated: '0',
  };
};

export interface LeaderboardEntry {
  address: string;
  volume: string;
}

export const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  // TODO: Replace with The Graph query against contract events.
  return [];
};

// ============== LISTINGS (Delegated to multiversxApi.ts) ==============
// Core NFT fetching lives in services/multiversxApi.ts which calls
// https://api.multiversx.com directly.

export { fetchMarketplaceNFTs, fetchCollections, searchNFTs, fetchNFTDetails } from './multiversxApi';
