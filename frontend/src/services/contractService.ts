const GATEWAY_URL = 'https://devnet-gateway.multiversx.com';
const CONTRACT_ADDRESS = 'erd1qqqqqqqqqqqqqpgqmzpauhqppu707208j8zrjq8q7trpgw7yvhuqtjt9ev';

export interface Listing {
  listing_id: number;
  seller: string;
  token_id: string;
  token_nonce: number;
  amount: string;
  price_token: string;
  price_amount: string;
  created_at: number;
  active: boolean;
}

export interface Auction {
  auction_id: number;
  seller: string;
  token_id: string;
  token_nonce: number;
  amount: string;
  min_bid: string;
  highest_bid: string;
  highest_bidder: string | null;
  end_time: number;
  payment_token: string;
  active: boolean;
}

const decodeBase64 = (b64: string): string => {
  try {
    if (!b64 || b64 === 'AA==' || b64 === '') return '';
    return atob(b64);
  } catch {
    return '';
  }
};

const decodeBigUint = (b64: string): string => {
  try {
    if (!b64 || b64 === 'AA==' || b64 === '') return '0';
    const binary = atob(b64);
    let hex = '';
    for (let i = 0; i < binary.length; i++) {
      hex += binary.charCodeAt(i).toString(16).padStart(2, '0');
    }
    return BigInt('0x' + hex).toString();
  } catch {
    return '0';
  }
};

const decodeAddress = (b64: string): string => {
  try {
    if (!b64 || b64 === 'AA==' || b64 === '') return '';
    const hex = atob(b64);
    return 'erd1...' + hex.slice(-8);
  } catch {
    return '';
  }
};

const encodeUint64 = (num: number): string => {
  return num.toString(16).padStart(16, '0');
};

export const contractService = {
  
  async getListing(id: number): Promise<Listing | null> {
    try {
      const response = await fetch(`${GATEWAY_URL}/vm-values/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scAddress: CONTRACT_ADDRESS,
          funcName: "getListing",
          args: [encodeUint64(id)]
        })
      });

      if (!response.ok) {
        console.log('Listing fetch failed:', response.status);
        return null;
      }
      
      const data = await response.json();
      const returnData = data?.data?.data?.returnData;
      
      if (!returnData || returnData.length === 0) {
        return null;
      }

      return {
        listing_id: id,
        seller: decodeAddress(returnData[1]),
        token_id: decodeBase64(returnData[2]),
        token_nonce: parseInt(returnData[3] ? atob(returnData[3]).split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('') : '0', 16) || 0,
        amount: decodeBigUint(returnData[4]),
        price_token: decodeBase64(returnData[5]),
        price_amount: decodeBigUint(returnData[6]),
        created_at: parseInt(returnData[7] ? atob(returnData[7]).split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('') : '0', 16) || 0,
        active: returnData[8] ? atob(returnData[8]).charCodeAt(0) === 1 : false
      };
    } catch (e) {
      console.error('getListing error:', e);
      return null;
    }
  },

  async getAuction(id: number): Promise<Auction | null> {
    try {
      const response = await fetch(`${GATEWAY_URL}/vm-values/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scAddress: CONTRACT_ADDRESS,
          funcName: "getAuction",
          args: [encodeUint64(id)]
        })
      });

      if (!response.ok) {
        console.log('Auction fetch failed:', response.status);
        return null;
      }
      
      const data = await response.json();
      const returnData = data?.data?.data?.returnData;
      
      if (!returnData || returnData.length === 0) {
        return null;
      }

      return {
        auction_id: id,
        seller: decodeAddress(returnData[1]),
        token_id: decodeBase64(returnData[2]),
        token_nonce: parseInt(returnData[3] ? atob(returnData[3]).split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('') : '0', 16) || 0,
        amount: decodeBigUint(returnData[4]),
        min_bid: decodeBigUint(returnData[5]),
        highest_bid: decodeBigUint(returnData[6]),
        highest_bidder: returnData[7] && returnData[7] !== 'AA==' ? decodeAddress(returnData[7]) : null,
        end_time: parseInt(returnData[8] ? atob(returnData[8]).split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('') : '0', 16) || 0,
        payment_token: decodeBase64(returnData[9]),
        active: returnData[10] ? atob(returnData[10]).charCodeAt(0) === 1 : false
      };
    } catch (e) {
      console.error('getAuction error:', e);
      return null;
    }
  },

  async getAllListings(limit: number = 20): Promise<Listing[]> {
    const listings: Listing[] = [];
    for (let i = 1; i <= limit; i++) {
      try {
        const listing = await this.getListing(i);
        if (listing?.active) listings.push(listing);
      } catch (e) {
        break;
      }
    }
    return listings;
  },

  async getAllAuctions(limit: number = 20): Promise<Auction[]> {
    const auctions: Auction[] = [];
    for (let i = 1; i <= limit; i++) {
      try {
        const auction = await this.getAuction(i);
        if (auction?.active) auctions.push(auction);
      } catch (e) {
        break;
      }
    }
    return auctions;
  },

  formatEGLD(amount: string): string {
    try {
      const bn = BigInt(amount);
      const divisor = BigInt(10 ** 18);
      const integer = bn / divisor;
      const fraction = bn % divisor;
      return `${integer}.${fraction.toString().padStart(18, '0').slice(0, 4)}`;
    } catch {
      return '0.0000';
    }
  },

  getTimeLeft(endTime: number): string {
    const now = Math.floor(Date.now() / 1000);
    const diff = endTime - now;
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return `${hours}h ${minutes}m`;
  },

  buildBuyTransaction(listingId: number, paymentToken: string, paymentAmount: string) {
    return {
      receiver: CONTRACT_ADDRESS,
      value: paymentToken === 'EGLD' ? paymentAmount : '0',
      gasLimit: 15000000,
      data: `buyListing@${this.encodeHex(listingId)}`,
      tokens: paymentToken !== 'EGLD' ? [{
        tokenIdentifier: paymentToken,
        amount: paymentAmount
      }] : []
    };
  },

  buildBidTransaction(auctionId: number, bidToken: string, bidAmount: string) {
    return {
      receiver: CONTRACT_ADDRESS,
      value: bidToken === 'EGLD' ? bidAmount : '0',
      gasLimit: 15000000,
      data: `placeBid@${this.encodeHex(auctionId)}`,
      tokens: bidToken !== 'EGLD' ? [{
        tokenIdentifier: bidToken,
        amount: bidAmount
      }] : []
    };
  },

  buildCreateListingTransaction(
    nftTokenId: string, 
    nftNonce: number, 
    nftAmount: string,
    priceToken: string, 
    priceAmount: string
  ) {
    return {
      receiver: CONTRACT_ADDRESS,
      value: '0',
      gasLimit: 10000000,
      data: `createListing@${this.encodeString(priceToken)}@${this.encodeBigInt(priceAmount)}`,
      tokens: [{
        tokenIdentifier: nftTokenId,
        nonce: nftNonce,
        amount: nftAmount
      }]
    };
  },

  buildCreateAuctionTransaction(
    nftTokenId: string,
    nftNonce: number,
    nftAmount: string,
    minBid: string,
    durationSeconds: number,
    paymentToken: string
  ) {
    return {
      receiver: CONTRACT_ADDRESS,
      value: '0',
      gasLimit: 12000000,
      data: `createAuction@${this.encodeBigInt(minBid)}@${this.encodeHex(durationSeconds)}@${this.encodeString(paymentToken)}`,
      tokens: [{
        tokenIdentifier: nftTokenId,
        nonce: nftNonce,
        amount: nftAmount
      }]
    };
  },

  encodeHex(num: number): string {
    return num.toString(16).padStart(16, '0');
  },

  encodeString(str: string): string {
    return str.split('').map(c => c.charCodeAt(0).toString(16)).join('');
  },

  encodeBigInt(value: string): string {
    const bn = BigInt(value);
    let hex = bn.toString(16);
    if (hex.length % 2 !== 0) hex = '0' + hex;
    return hex;
  }
};
