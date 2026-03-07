// hooks/useContract.ts
import { useSdk } from '../components/stubs/SdkStubs';
import { useEffect, useState, useCallback } from 'react';
import { 
  SmartContract, 
  Address, 
  ContractFunction,
  TokenTransfer,
  Transaction,
  TransactionPayload
} from '@multiversx/sdk-core';

// Your actual marketplace contract address (devnet for now)
const MARKETPLACE_CONTRACT_ADDRESS = 'erd1qqqqqqqqqqqqqpgqhy6nl6zq07rn7ygqg9k0tpy97y06pf7cgqqq6f4sf4';

export const useMarketplaceContract = () => {
  const { address, isAuthenticated, sendTransaction } = useSdk();
  const [isReady, setIsReady] = useState(false);
  const [contract, setContract] = useState<SmartContract | null>(null);

  // Initialize contract instance
  useEffect(() => {
    if (!isAuthenticated) {
      setIsReady(false);
      return;
    }

    try {
      // Create contract instance (stubbed for now)
      const contractInstance = new SmartContract({
        address: new Address(MARKETPLACE_CONTRACT_ADDRESS),
      });
      
      setContract(contractInstance);
      setIsReady(true);
    } catch (error) {
      console.error('Failed to initialize contract:', error);
      setIsReady(false);
    }
  }, [isAuthenticated]);

  // Create NFT Listing
  const createListing = useCallback(async (
    tokenIdentifier: string, 
    nonce: number, 
    price: string,
    quantity: number = 1
  ) => {
    if (!isAuthenticated || !address) {
      throw new Error('Wallet not connected');
    }

    console.log('Creating listing:', { tokenIdentifier, nonce, price, quantity });

    // Stub transaction - replace with actual contract call when ready
    const txData = new TransactionPayload(
      `createListing@${Buffer.from(tokenIdentifier).toString('hex')}@${nonce.toString(16)}@${BigInt(parseFloat(price) * 1e18).toString(16)}`
    );

    return await sendTransaction({
      type: 'createListing',
      data: {
        tokenIdentifier,
        nonce,
        price,
        quantity,
        sender: address,
        contractAddress: MARKETPLACE_CONTRACT_ADDRESS,
        payload: txData.toString()
      }
    });
  }, [isAuthenticated, address, sendTransaction]);

  // Buy NFT
  const buyListing = useCallback(async (
    listingId: number,
    price: string,
    tokenIdentifier?: string
  ) => {
    if (!isAuthenticated) {
      throw new Error('Wallet not connected');
    }

    console.log('Buying listing:', { listingId, price });

    return await sendTransaction({
      type: 'buyListing',
      data: {
        listingId,
        price,
        buyer: address,
        tokenIdentifier: tokenIdentifier || 'EGLD'
      }
    });
  }, [isAuthenticated, address, sendTransaction]);

  // Cancel Listing
  const cancelListing = useCallback(async (listingId: number) => {
    if (!isAuthenticated) {
      throw new Error('Wallet not connected');
    }

    console.log('Cancelling listing:', listingId);

    return await sendTransaction({
      type: 'cancelListing',
      data: {
        listingId,
        seller: address
      }
    });
  }, [isAuthenticated, address, sendTransaction]);

  // Create Auction (for auction functionality)
  const createAuction = useCallback(async (
    tokenIdentifier: string,
    nonce: number,
    minBid: string,
    startTime: number,
    endTime: number
  ) => {
    if (!isAuthenticated) {
      throw new Error('Wallet not connected');
    }

    console.log('Creating auction:', { tokenIdentifier, nonce, minBid, startTime, endTime });

    return await sendTransaction({
      type: 'createAuction',
      data: {
        tokenIdentifier,
        nonce,
        minBid,
        startTime,
        endTime,
        seller: address
      }
    });
  }, [isAuthenticated, address, sendTransaction]);

  // Place Bid
  const placeBid = useCallback(async (auctionId: number, bidAmount: string) => {
    if (!isAuthenticated) {
      throw new Error('Wallet not connected');
    }

    console.log('Placing bid:', { auctionId, bidAmount });

    return await sendTransaction({
      type: 'placeBid',
      data: {
        auctionId,
        bidAmount,
        bidder: address
      }
    });
  }, [isAuthenticated, address, sendTransaction]);

  return {
    isReady,
    isAuthenticated,
    contractAddress: MARKETPLACE_CONTRACT_ADDRESS,
    contract,
    // Listing operations
    createListing,
    buyListing,
    cancelListing,
    // Auction operations
    createAuction,
    placeBid,
  };
};

// Specialized hook for ESDT operations
export const useESDTContract = () => {
  const { address, isAuthenticated, sendTransaction } = useSdk();

  const transferESDT = useCallback(async (
    tokenIdentifier: string,
    amount: string,
    recipient: string
  ) => {
    if (!isAuthenticated) {
      throw new Error('Wallet not connected');
    }

    console.log('Transferring ESDT:', { tokenIdentifier, amount, recipient });

    return await sendTransaction({
      type: 'esdtTransfer',
      data: {
        tokenIdentifier,
        amount,
        sender: address,
        recipient
      }
    });
  }, [isAuthenticated, address, sendTransaction]);

  return {
    transferESDT,
    isAuthenticated,
  };
};

// Specialized hook for NFT operations
export const useNFTContract = () => {
  const { address, isAuthenticated, sendTransaction } = useSdk();

  const transferNFT = useCallback(async (
    tokenIdentifier: string,
    nonce: number,
    recipient: string
  ) => {
    if (!isAuthenticated) {
      throw new Error('Wallet not connected');
    }

    console.log('Transferring NFT:', { tokenIdentifier, nonce, recipient });

    return await sendTransaction({
      type: 'nftTransfer',
      data: {
        tokenIdentifier,
        nonce,
        sender: address,
        recipient
      }
    });
  }, [isAuthenticated, address, sendTransaction]);

  return {
    transferNFT,
    isAuthenticated,
  };
};

export default useMarketplaceContract;
