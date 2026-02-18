import { 
  ProxyNetworkProvider, 
  Address, 
  Transaction,
  TransactionPayload,
  BigUIntValue,
  U64Value,
  BytesValue,
  ContractFunction,
  SmartContract,
  ResultsParser,
  Account  // Now available in sdk-core
} from '@multiversx/sdk-core';

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

class ContractService {
  private provider: ProxyNetworkProvider;
  private contract: SmartContract;
  private resultsParser: ResultsParser;

  constructor() {
    this.provider = new ProxyNetworkProvider(GATEWAY_URL);
    this.contract = new SmartContract({
      address: new Address(CONTRACT_ADDRESS)
    });
    this.resultsParser = new ResultsParser();
  }

  // ==================== VIEW FUNCTIONS (Queries) ====================

  async getListing(listingId: number): Promise<Listing | null> {
    try {
      const query = this.contract.createQuery({
        func: new ContractFunction('getListing'),
        args: [new U64Value(listingId)]
      });

      const response = await this.provider.queryContract(query);
      const result = this.resultsParser.parseQueryResponse(response);
      
      if (!result || result.length === 0) return null;

      const listingData = result[0].valueOf();
      return {
        owner: listingData.owner?.toString() || '',
        nft_token_id: listingData.nft_token_id?.toString() || '',
        nft_nonce: listingData.nft_nonce?.toNumber() || 0,
        price: listingData.price?.toString() || '0',
        status: this.mapStatus(listingData.status?.toString())
      };
    } catch (error) {
      console.error('Error fetching listing:', error);
      return null;
    }
  }

  async getListingCount(): Promise<number> {
    try {
      const query = this.contract.createQuery({
        func: new ContractFunction('getListingCount')
      });

      const response = await this.provider.queryContract(query);
      const result = this.resultsParser.parseQueryResponse(response);
      
      return result[0]?.toNumber() || 0;
    } catch (error) {
      console.error('Error fetching listing count:', error);
      return 0;
    }
  }

  async getDutchAuction(auctionId: number): Promise<DutchAuction | null> {
    try {
      const query = this.contract.createQuery({
        func: new ContractFunction('getDutchAuction'),
        args: [new U64Value(auctionId)]
      });

      const response = await this.provider.queryContract(query);
      const result = this.resultsParser.parseQueryResponse(response);
      
      if (!result || result.length === 0) return null;

      const data = result[0].valueOf();
      let currentPrice = data.start_price?.toString() || '0';
      
      if (data.status?.toString() === 'Active') {
        currentPrice = await this.getCurrentDutchPrice(auctionId) || currentPrice;
      }

      return {
        auction_id: auctionId,
        seller: data.seller?.toString() || '',
        token_id: data.token_id?.toString() || data.token?.token_identifier?.toString() || '',
        token_nonce: data.token_nonce?.toNumber() || data.token?.token_nonce?.toNumber() || 0,
        start_price: data.start_price?.toString() || '0',
        end_price: data.end_price?.toString() || '0',
        start_time: data.start_time?.toNumber() || 0,
        end_time: data.end_time?.toNumber() || 0,
        current_price: currentPrice,
        status: data.status?.toString() || 'Unknown'
      };
    } catch (error) {
      console.error('Error fetching auction:', error);
      return null;
    }
  }

  async getCurrentDutchPrice(auctionId: number): Promise<string | null> {
    try {
      const query = this.contract.createQuery({
        func: new ContractFunction('getCurrentPrice'),
        args: [new U64Value(auctionId)]
      });

      const response = await this.provider.queryContract(query);
      const result = this.resultsParser.parseQueryResponse(response);
      
      return result[0]?.toString() || null;
    } catch (error) {
      console.error('Error fetching current price:', error);
      return null;
    }
  }

  async getLastAuctionId(): Promise<number> {
    try {
      const query = this.contract.createQuery({
        func: new ContractFunction('getLastAuctionId')
      });

      const response = await this.provider.queryContract(query);
      const result = this.resultsParser.parseQueryResponse(response);
      
      return result[0]?.toNumber() || 0;
    } catch (error) {
      console.error('Error fetching last auction ID:', error);
      return 0;
    }
  }

  // ==================== TRANSACTION PREPARATION ====================

  prepareCreateListingTransaction(
    senderAddress: string,
    tokenId: string,
    nonce: number,
    price: string,
    tokenTransferAmount: number = 1
  ): Transaction {
    const data = TransactionPayload.contractCall()
      .setFunction(new ContractFunction('ESDTNFTTransfer'))
      .setArgs([
        BytesValue.fromUTF8(tokenId),
        new U64Value(nonce),
        new U64Value(tokenTransferAmount),
        BytesValue.fromHex(new Address(CONTRACT_ADDRESS).hex()),
        BytesValue.fromUTF8('createListing'),
        BytesValue.fromUTF8(tokenId),
        new U64Value(nonce),
        new BigUIntValue(price)
      ])
      .build();

    return new Transaction({
      nonce: 0,
      value: '0',
      sender: new Address(senderAddress),
      receiver: new Address(senderAddress),
      gasLimit: 20000000,
      data: data,
      chainID: 'D'
    });
  }

  prepareBuyListingTransaction(
    senderAddress: string,
    listingId: number,
    price: string
  ): Transaction {
    const data = TransactionPayload.contractCall()
      .setFunction(new ContractFunction('buyListing'))
      .setArgs([new U64Value(listingId)])
      .build();

    return new Transaction({
      nonce: 0,
      value: price,
      sender: new Address(senderAddress),
      receiver: new Address(CONTRACT_ADDRESS),
      gasLimit: 20000000,
      data: data,
      chainID: 'D'
    });
  }

  prepareCancelListingTransaction(
    senderAddress: string,
    listingId: number
  ): Transaction {
    const data = TransactionPayload.contractCall()
      .setFunction(new ContractFunction('cancelListing'))
      .setArgs([new U64Value(listingId)])
      .build();

    return new Transaction({
      nonce: 0,
      value: '0',
      sender: new Address(senderAddress),
      receiver: new Address(CONTRACT_ADDRESS),
      gasLimit: 15000000,
      data: data,
      chainID: 'D'
    });
  }

  prepareBuyDutchAuctionTransaction(
    senderAddress: string,
    auctionId: number,
    currentPrice: string
  ): Transaction {
    const data = TransactionPayload.contractCall()
      .setFunction(new ContractFunction('buyDutchAuction'))
      .setArgs([new U64Value(auctionId)])
      .build();

    return new Transaction({
      nonce: 0,
      value: currentPrice,
      sender: new Address(senderAddress),
      receiver: new Address(CONTRACT_ADDRESS),
      gasLimit: 25000000,
      data: data,
      chainID: 'D'
    });
  }

  // ==================== HELPERS ====================

  private mapStatus(status: string): 'Active' | 'Sold' | 'Cancelled' {
    const statusMap: { [key: string]: 'Active' | 'Sold' | 'Cancelled' } = {
      '0': 'Active',
      '1': 'Sold',
      '2': 'Cancelled'
    };
    return statusMap[status] || 'Active';
  }

  async getAccountNonce(address: string): Promise<number> {
    try {
      const account = await this.provider.getAccount(new Address(address));
      return account.nonce;
    } catch (error) {
      console.error('Error fetching nonce:', error);
      return 0;
    }
  }

  async waitForTransaction(txHash: string, timeout: number = 60000): Promise<any> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const status = await this.provider.getTransactionStatus(txHash);
        
        if (status.isSuccessful()) {
          return { status: 'success', hash: txHash };
        } else if (status.isFailed()) {
          return { status: 'failed', hash: txHash, error: status.toString() };
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return { status: 'timeout', hash: txHash };
  }
}

export const contractService = new ContractService();
