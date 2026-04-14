const API_URL = 'https://api.multiversx.com';

export interface NFT {
  identifier: string;
  collection: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  owner: string;
  creator?: string;
  balance?: string;
  decimals?: number;
  assets?: {
    url?: string;
    thumbnailUrl?: string;
    description?: string;
  };
  metadata?: {
    description?: string;
    tags?: string[];
  };
  price?: string;
  listing?: {
    price: string;
    currency: string;
  };
}

export interface NFTResponse {
  items: NFT[];
  total: number;
  hasMore?: boolean;
}

export const fetchMarketplaceNFTs = async (params: {
  search?: string;
  collection?: string;
  tags?: string[];
  priceMin?: number;
  priceMax?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  size?: number;
} = {}): Promise<NFTResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.search) queryParams.set('search', params.search);
  if (params.collection) queryParams.set('collection', params.collection);
  if (params.tags?.length) queryParams.set('tags', params.tags.join(','));
  if (params.priceMin) queryParams.set('priceMin', params.priceMin.toString());
  if (params.priceMax) queryParams.set('priceMax', params.priceMax.toString());
  if (params.sort) queryParams.set('sort', params.sort);
  if (params.page) queryParams.set('from', ((params.page - 1) * (params.size || 20)).toString());
  if (params.size) queryParams.set('size', params.size.toString());
  
  const response = await fetch(`${API_URL}/nfts?${queryParams.toString()}&withOwner=true&withMetadata=true`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch NFTs');
  }
  
  const data = await response.json();
  return { items: data, total: data.length, hasMore: data.length === (params.size || 20) };
};

export const fetchCollections = async (): Promise<string[]> => {
  const response = await fetch(`${API_URL}/collections?type=NonFungibleESDT&size=100`);
  const data = await response.json();
  return data.map((c: any) => c.collection);
};

export const searchNFTs = async (query: string): Promise<NFT[]> => {
  const response = await fetch(`${API_URL}/nfts?search=${encodeURIComponent(query)}&size=20&withMetadata=true`);
  return await response.json();
};
