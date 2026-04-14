// src/services/multiversxApi.ts
const API_URL = 'http://localhost:3001'; // Your backend

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
  price?: string;
  currency?: string;
  seller?: string;
  status?: 'active' | 'sold' | 'cancelled';
  listedAt?: string;
  assets?: {
    url?: string;
    thumbnailUrl?: string;
    description?: string;
  };
  metadata?: {
    description?: string;
    tags?: string[];
  };
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
} = {}): Promise<{ items: NFT[]; total: number }> => {
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.set('search', params.search);
  if (params.collection) queryParams.set('collection', params.collection);
  if (params.tags?.length) queryParams.set('tags', params.tags.join(','));
  if (params.priceMin) queryParams.set('minPrice', params.priceMin.toString());
  if (params.priceMax) queryParams.set('maxPrice', params.priceMax.toString());
  
  // Map sort to backend format
  if (params.sort) {
    const sortMap = {
      'newest': 'recent',
      'price_asc': 'price_asc',
      'price_desc': 'price_desc'
    };
    queryParams.set('sortBy', sortMap[params.sort] || 'recent');
  }
  
  const page = params.page || 1;
  const limit = params.size || 20;
  queryParams.set('page', page.toString());
  queryParams.set('limit', limit.toString());

  // Call YOUR backend listings endpoint
  const response = await fetch(`${API_URL}/api/listings?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch listings');
  }

  const result = await response.json();
  
  // Backend returns { success: true, data: [...] }
  const data = result.data || [];
  
  return { 
    items: data, 
    total: data.length 
  };
};

export const fetchCollections = async (): Promise<string[]> => {
  const response = await fetch(`${API_URL}/api/listings/collections`);
  const result = await response.json();
  return result.data?.map((c: any) => c.id || c.collection) || [];
};

export const searchNFTs = async (query: string): Promise<NFT[]> => {
  const response = await fetch(`${API_URL}/api/listings?search=${encodeURIComponent(query)}&limit=20`);
  const result = await response.json();
  return result.data || [];
};

// Get single NFT details with price
export const fetchNFTDetails = async (identifier: string): Promise<NFT | null> => {
  const response = await fetch(`${API_URL}/api/listings/${encodeURIComponent(identifier)}`);
  const result = await response.json();
  return result.data || null;
};
