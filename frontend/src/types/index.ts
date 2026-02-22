export interface Listing {
  id?: number;
  owner: string;
  nft_token_id: string;
  nft_nonce: number;
  price: string;
  status: 'Active' | 'Sold' | 'Cancelled';
}

export interface DutchAuction {
  auction_id: number;
  seller: string;
  token_id: string;
  token_nonce: number;
  start_price: string;
  end_price: string;
  start_time: number;
  end_time: number;
  current_price: string;
  status: string;
}

export interface CreateListingParams {
  tokenId: string;
  nonce: number;
  price: string;
}

export interface BuyListingParams {
  listingId: number;
  price: string;
}
