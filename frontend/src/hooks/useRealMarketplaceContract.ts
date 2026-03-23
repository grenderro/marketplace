import { useCallback } from 'react';
import {
  Address,
  Transaction,
  TokenTransfer
} from '@multiversx/sdk-core';
import { useSdk } from '../components/stubs/SdkStubs';

// Your actual devnet contract address
const CONTRACT_ADDRESS = 'erd1qqqqqqqqqqqqqpgqmzpauhqppu707208j8zrjq8q7trpgw7yvhuqtjt9ev';
const CHAIN_ID = 'D';

// Helper functions for encoding
const toHex = (str: string) => Buffer.from(str, 'utf-8').toString('hex');
const toHexU64 = (num: number) => num.toString(16).padStart(16, '0');
const toHexBigInt = (value: bigint) => value.toString(16).padStart(16, '0');

export const useRealMarketplaceContract = () => {
  const sdk = useSdk();
  const address = sdk.address;
  const isAuthenticated = sdk.isAuthenticated;

  const createListing = useCallback(async (
    tokenIdentifier: string,
    nonce: number,
    price: string
  ) => {
    if (!isAuthenticated || !address) {
      throw new Error('Wallet not connected');
    }

    // Build transaction data manually: functionName@arg1Hex@arg2Hex...
    const priceAtomic = BigInt(Math.floor(parseFloat(price) * 1e18));
    const dataString = `createListing@${toHex(tokenIdentifier)}@${toHexU64(nonce)}@${toHexBigInt(priceAtomic)}`;
    const data = new TextEncoder().encode(dataString);

    const tx = new Transaction({
      nonce: sdk.nonce || 0,
      value: TokenTransfer.egldFromAmount(0), // No EGLD required for listing
      sender: Address.fromBech32(address),
      receiver: Address.fromBech32(CONTRACT_ADDRESS),
      gasLimit: 10000000,
      data: data as any,
      chainID: CHAIN_ID,
    });

    return tx;
  }, [address, isAuthenticated, sdk.nonce]);

  const buyItem = useCallback(async (listingId: string, price: string) => {
    if (!isAuthenticated || !address) {
      throw new Error('Wallet not connected');
    }

    // buy@listingIdHex
    const dataString = `buy@${toHex(listingId)}`;
    const data = new TextEncoder().encode(dataString);

    // Convert price to atomic units (EGLD has 18 decimals)
    const priceFloat = parseFloat(price);
    const value = TokenTransfer.egldFromAmount(priceFloat);

    const tx = new Transaction({
      nonce: sdk.nonce || 0,
      value: value,
      sender: Address.fromBech32(address),
      receiver: Address.fromBech32(CONTRACT_ADDRESS),
      gasLimit: 10000000,
      data: data as any,
      chainID: CHAIN_ID,
    });

    return tx;
  }, [address, isAuthenticated, sdk.nonce]);

  const cancelListing = useCallback(async (listingId: string) => {
    if (!isAuthenticated || !address) {
      throw new Error('Wallet not connected');
    }

    // cancelListing@listingIdHex
    const dataString = `cancelListing@${toHex(listingId)}`;
    const data = new TextEncoder().encode(dataString);

    const tx = new Transaction({
      nonce: sdk.nonce || 0,
      value: TokenTransfer.egldFromAmount(0),
      sender: Address.fromBech32(address),
      receiver: Address.fromBech32(CONTRACT_ADDRESS),
      gasLimit: 10000000,
      data: data as any,
      chainID: CHAIN_ID,
    });

    return tx;
  }, [address, isAuthenticated, sdk.nonce]);

  return {
    createListing,
    buyItem,
    cancelListing,
    address,
    isAuthenticated
  };
};
