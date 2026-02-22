const GATEWAY_URL = 'https://devnet-gateway.multiversx.com';
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || 'erd1qqqqqqqqqqqqqpgqmzpauhqppu707208j8zrjq8q7trpgw7yvhuqtjt9ev';

export interface Listing {
  id?: number;
  owner: string;
  nft_token_id: string;
  nft_nonce: number;
  price: string;
  status: 'Active' | 'Sold' | 'Cancelled';
}

// Helper to convert number to hex
const toHex = (num: number) => num.toString(16).padStart(2, '0');

export const contractService = {
  async getListingCount(): Promise<number> {
    try {
      const response = await fetch(`${GATEWAY_URL}/vm-values/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scAddress: CONTRACT_ADDRESS,
          funcName: "getListingCount",
          args: []
        })
      });
      const data = await response.json();
      if (data?.data?.data?.returnData?.[0]) {
        return parseInt(data.data.data.returnData[0], 16);
      }
      return 0;
    } catch (e) {
      console.error('Error fetching count:', e);
      return 0;
    }
  },

  async getListing(listingId: number): Promise<Listing | null> {
    try {
      const response = await fetch(`${GATEWAY_URL}/vm-values/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scAddress: CONTRACT_ADDRESS,
          funcName: "getListing",
          args: [toHex(listingId)]
        })
      });
      
      const data = await response.json();
      if (!data?.data?.data?.returnData) return null;

      // Parse the returned data (adjust based on your contract structure)
      const returnData = data.data.data.returnData;
      if (returnData.length === 0) return null;

      // Basic parsing - adjust field indices based on your contract
      return {
        owner: returnData[0] ? Buffer.from(returnData[0], 'base64').toString('hex') : '',
        nft_token_id: returnData[1] ? Buffer.from(returnData[1], 'base64').toString() : '',
        nft_nonce: returnData[2] ? parseInt(returnData[2], 16) : 0,
        price: returnData[3] ? parseInt(returnData[3], 16).toString() : '0',
        status: 'Active'
      };
    } catch (e) {
      console.error('Error fetching listing:', e);
      return null;
    }
  }
};
