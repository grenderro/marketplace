// server/aggregator/nftAggregator.ts
import { ApiNetworkProvider } from '@multiversx/sdk-core';
import axios from 'axios';
import { Redis } from 'ioredis';

interface NFTListing {
  id: string;
  source: 'xexchange' | 'frameit' | 'krogan' | 'isengard' | 'custom';
  collection: string;
  nonce: number;
  identifier: string; // COLLECTION-nonce
  name: string;
  imageUrl: string;
  metadata?: any;
  
  // Sale info
  type: 'fixed' | 'auction';
  price: string;
  priceUsd?: string;
  currency: string;
  seller: string;
  
  // Marketplace specific
  marketplaceId?: string;
  listingId?: string;
  auctionId?: string;
  endTime?: number; // For auctions
  
  // Stats
  rarity?: number;
  rank?: number;
  
  // Links
  marketplaceUrl: string;
  explorerUrl: string;
}

interface CollectionStats {
  identifier: string;
  name: string;
  ticker: string;
  floorPrice: string;
  volume24h: string;
  items: number;
  holders: number;
}

class NFTAggregator {
  private redis: Redis;
  private mvxApi: ApiNetworkProvider;
  private readonly CACHE_TTL = 300; // 5 minutes
  
  // Major marketplace contract addresses
  private readonly MARKETPLACES = {
    xexchange: 'erd1qqqqqqqqqqqqqpgqqz6vp9y50ep867vnr296mqf3dduh6guvmvlsu3sujc',
    frameit: 'erd1qqqqqqqqqqqqqpgq8xqp6c0kzwn3f2c5zs5k2vhxv5z0z3dnmvls09p7w6',
    krogan: 'erd1qqqqqqqqqqqqqpgq0tajepcazernwt74820t8ef7t28vjfukmvlszk8snr',
    isengard: 'erd1qqqqqqqqqqqqqpgq5l05l0ts4lphdktx33apl0ss9rzf4r8nmvlsc2g3r3',
  };

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.mvxApi = new ApiNetworkProvider('https://api.multiversx.com');
  }

  // ============== MAIN ENTRY POINT ==============
  
  async getAllListings(filters: ListingFilters): Promise<{
    listings: NFTListing[];
    total: number;
    collections: CollectionStats[];
    hasMore: boolean;
  }> {
    const cacheKey = `listings:${JSON.stringify(filters)}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from all sources in parallel
    const [xexchange, frameit, krogan, isengard, apiListings] = await Promise.all([
      this.fetchXExchangeListings(filters),
      this.fetchFrameItListings(filters),
      this.fetchKroganListings(filters),
      this.fetchIsengardListings(filters),
      this.fetchApiListings(filters),
    ]);

    // Merge and deduplicate (same NFT might be listed on multiple platforms)
    const allListings = this.mergeListings([
      ...xexchange,
      ...frameit,
      ...krogan,
      ...isengard,
      ...apiListings,
    ]);

    // Sort by price or recently listed
    const sorted = this.sortListings(allListings, filters.sortBy);
    
    // Paginate
    const start = (filters.page - 1) * filters.limit;
    const paginated = sorted.slice(start, start + filters.limit);

    // Get collection stats
    const collections = await this.getTopCollections();

    const result = {
      listings: paginated,
      total: sorted.length,
      collections,
      hasMore: start + filters.limit < sorted.length,
    };

    // Cache for 5 minutes
    await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(result));
    
    return result;
  }

  // ============== MARKETPLACE FETCHERS ==============

  private async fetchXExchangeListings(filters: ListingFilters): Promise<NFTListing[]> {
    try {
      // Query xExchange marketplace contract
      const query = await this.mvxApi.queryContract({
        address: this.MARKETPLACES.xexchange,
        func: 'getAllListings',
        args: [],
      });

      // Parse results
      const listings: NFTListing[] = [];
      // ... parsing logic based on contract return format
      
      return listings.map(l => ({ ...l, source: 'xexchange' as const }));
    } catch (e) {
      console.error('xExchange fetch failed:', e);
      return [];
    }
  }

  private async fetchFrameItListings(filters: ListingFilters): Promise<NFTListing[]> {
    try {
      // FrameIt has a GraphQL API
      const response = await axios.post('https://api.frameit.gg/graphql', {
        query: `
          query GetListings($first: Int!, $skip: Int!) {
            listings(
              first: $first,
              skip: $skip,
              orderBy: price,
              orderDirection: asc,
              where: { status: Active }
            ) {
              id
              tokenId
              collection
              price
              seller
              currency
              listingType
              endTime
              nft {
                name
                image
                metadata
                rarity
              }
            }
          }
        `,
        variables: {
          first: filters.limit,
          skip: (filters.page - 1) * filters.limit,
        },
      });

      return response.data.data.listings.map((l: any) => ({
        id: `frameit-${l.id}`,
        source: 'frameit',
        collection: l.collection,
        nonce: parseInt(l.tokenId.split('-')[2]),
        identifier: l.tokenId,
        name: l.nft.name,
        imageUrl: l.nft.image,
        type: l.listingType.toLowerCase(),
        price: l.price,
        currency: l.currency,
        seller: l.seller,
        endTime: l.endTime,
        marketplaceUrl: `https://frameit.gg/nft/${l.tokenId}`,
        explorerUrl: `https://explorer.multiversx.com/nfts/${l.tokenId}`,
        rarity: l.nft.rarity,
      }));
    } catch (e) {
      console.error('FrameIt fetch failed:', e);
      return [];
    }
  }

  private async fetchKroganListings(filters: ListingFilters): Promise<NFTListing[]> {
    try {
      const response = await axios.get('https://api.krogan.gg/marketplace/listings', {
        params: {
          page: filters.page,
          limit: filters.limit,
          sort: filters.sortBy,
          ...this.buildFilterParams(filters),
        },
      });

      return response.data.listings.map((l: any) => ({
        id: `krogan-${l.id}`,
        source: 'krogan',
        collection: l.collectionId,
        nonce: l.nonce,
        identifier: `${l.collectionId}-${l.nonce}`,
        name: l.name,
        imageUrl: l.image,
        type: l.auctionId ? 'auction' : 'fixed',
        price: l.price,
        currency: l.currency || 'EGLD',
        seller: l.owner,
        marketplaceUrl: `https://krogan.gg/asset/${l.collectionId}-${l.nonce}`,
        explorerUrl: `https://explorer.multiversx.com/nfts/${l.collectionId}-${l.nonce}`,
      }));
    } catch (e) {
      console.error('Krogan fetch failed:', e);
      return [];
    }
  }

  private async fetchIsengardListings(filters: ListingFilters): Promise<NFTListing[]> {
    try {
      const response = await axios.get('https://api.isengard.market/api/v1/listings', {
        headers: { 'X-API-Key': process.env.ISENGARD_API_KEY },
        params: {
          status: 'active',
          page: filters.page,
          limit: filters.limit,
        },
      });

      return response.data.data.map((l: any) => ({
        id: `isengard-${l.id}`,
        source: 'isengard',
        collection: l.token.identifier,
        nonce: l.token.nonce,
        identifier: `${l.token.identifier}-${l.token.nonce}`,
        name: l.token.name,
        imageUrl: l.token.url,
        type: l.type,
        price: l.price,
        currency: l.priceToken,
        seller: l.seller,
        endTime: l.endDate,
        marketplaceUrl: `https://isengard.market/nft/${l.token.identifier}-${l.token.nonce}`,
        explorerUrl: `https://explorer.multiversx.com/nfts/${l.token.identifier}-${l.token.nonce}`,
      }));
    } catch (e) {
      console.error('Isengard fetch failed:', e);
      return [];
    }
  }

  // ============== MULTIVERSX API ==============

  private async fetchApiListings(filters: ListingFilters): Promise<NFTListing[]> {
    // Fallback to MultiversX API for accounts with NFTs for sale
    try {
      const params: any = {
        size: filters.limit,
        from: (filters.page - 1) * filters.limit,
        withScamInfo: false,
      };

      if (filters.collection) {
        params.collection = filters.collection;
      }

      if (filters.search) {
        params.search = filters.search;
      }

      const response = await axios.get('https://api.multiversx.com/nfts', { params });

      // Filter those with price (listed)
      const listed = response.data.filter((nft: any) => 
        nft.marketData && nft.marketData.price
      );

      return listed.map((nft: any) => ({
        id: `api-${nft.identifier}`,
        source: 'custom',
        collection: nft.collection,
        nonce: nft.nonce,
        identifier: nft.identifier,
        name: nft.name || `${nft.collection} #${nft.nonce}`,
        imageUrl: nft.url,
        type: nft.marketData.auctionId ? 'auction' : 'fixed',
        price: nft.marketData.price,
        priceUsd: nft.marketData.priceUsd,
        currency: 'EGLD',
        seller: nft.marketData.seller,
        marketplaceUrl: nft.marketData.marketplace || `https://xoxno.com/nft/${nft.identifier}`,
        explorerUrl: `https://explorer.multiversx.com/nfts/${nft.identifier}`,
        metadata: nft.metadata,
      }));
    } catch (e) {
      console.error('MVX API fetch failed:', e);
      return [];
    }
  }

  // ============== HELPER METHODS ==============

  private mergeListings(listings: NFTListing[]): NFTListing[] {
    const seen = new Map<string, NFTListing>();
    
    for (const listing of listings) {
      const key = listing.identifier;
      const existing = seen.get(key);
      
      if (!existing) {
        seen.set(key, listing);
      } else {
        // Keep the cheapest listing if duplicate
        if (BigInt(listing.price) < BigInt(existing.price)) {
          seen.set(key, listing);
        }
      }
    }
    
    return Array.from(seen.values());
  }

  private sortListings(listings: NFTListing[], sortBy: string): NFTListing[] {
    switch (sortBy) {
      case 'price_asc':
        return listings.sort((a, b) => Number(BigInt(a.price) - BigInt(b.price)));
      case 'price_desc':
        return listings.sort((a, b) => Number(BigInt(b.price) - BigInt(a.price)));
      case 'recent':
        return listings.sort((a, b) => (b.endTime || 0) - (a.endTime || 0));
      case 'rarity':
        return listings.sort((a, b) => (b.rarity || 0) - (a.rarity || 0));
      default:
        return listings;
    }
  }

  private async getTopCollections(): Promise<CollectionStats[]> {
    const cacheKey = 'collections:top';
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      const response = await axios.get('https://api.multiversx.com/collections', {
        params: {
          size: 20,
          sort: 'volume',
          order: 'desc',
        },
      });

      const collections = response.data.map((c: any) => ({
        identifier: c.collection,
        name: c.name,
        ticker: c.ticker,
        floorPrice: c.floorPrice || '0',
        volume24h: c.volume24h || '0',
        items: c.nftsCount || 0,
        holders: c.holdersCount || 0,
      }));

      await this.redis.setex(cacheKey, 600, JSON.stringify(collections));
      return collections;
    } catch (e) {
      return [];
    }
  }

  private buildFilterParams(filters: ListingFilters): Record<string, any> {
    const params: Record<string, any> = {};
    
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.collection) params.collection = filters.collection;
    if (filters.seller) params.seller = filters.seller;
    
    return params;
  }
}

interface ListingFilters {
  page: number;
  limit: number;
  sortBy: 'price_asc' | 'price_desc' | 'recent' | 'rarity';
  collection?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  seller?: string;
  type?: 'fixed' | 'auction' | 'all';
}

export const nftAggregator = new NFTAggregator();
