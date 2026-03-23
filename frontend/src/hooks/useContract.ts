import { useCallback } from 'react';
import {
  Address,
  Transaction,
  TokenTransfer
} from '@multiversx/sdk-core';
import { useSdk } from '../components/stubs/SdkStubs';

const CONTRACT_ADDRESS = 'erd1qqqqqqqqqqqqqpgqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';

// Helper to encode string to hex
const toHex = (str: string) => Buffer.from(str, 'utf-8').toString('hex');
const toHexU64 = (num: number) => num.toString(16).padStart(16, '0');
const toHexBigInt = (value: bigint) => value.toString(16).padStart(16, '0');

export const useMarketplaceContract = () => {
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

    // Manual SC call encoding: functionName@arg1Hex@arg2Hex@arg3Hex
    const priceAtomic = BigInt(Math.floor(parseFloat(price) * 1e18));
    const dataString = `createListing@${toHex(tokenIdentifier)}@${toHexU64(nonce)}@${toHexBigInt(priceAtomic)}`;
    const data = new TextEncoder().encode(dataString); // Uint8Array

    // 0.05 EGLD in atomic units (18 decimals) = 50000000000000000
    const value = TokenTransfer.egldFromAmount(0.05);

    const tx = new Transaction({
      nonce: sdk.nonce || 0,
      value: value,
      sender: Address.fromBech32(address),
      receiver: Address.fromBech32(CONTRACT_ADDRESS),
      gasLimit: 10000000,
      data: data as any, // Cast to bypass type checking
      chainID: 'D',
    });

    return tx;
  }, [address, isAuthenticated, sdk.nonce]);

  return {
    isReady: isAuthenticated,
    createListing,
    address,
    isAuthenticated
  };
};

// Specialized hook for ESDT operations
export const useESDTContract = () => {
  const sdk = useSdk();
  const address = sdk.address;
  const isAuthenticated = sdk.isAuthenticated;

  const transferESDT = useCallback(async (
    tokenIdentifier: string,
    amount: string,
    receiverAddress: string
  ) => {
    if (!isAuthenticated || !address) {
      throw new Error('Wallet not connected');
    }

    // ESDTTransfer@tokenID@amountHex
    const hexToken = toHex(tokenIdentifier);
    const hexAmount = BigInt(amount).toString(16).padStart(16, '0');
    const dataString = `ESDTTransfer@${hexToken}@${hexAmount}`;
    const data = new TextEncoder().encode(dataString);

    const tx = new Transaction({
      nonce: sdk.nonce || 0,
      value: TokenTransfer.egldFromAmount(0), // 0 EGLD for ESDT transfers
      sender: Address.fromBech32(address),
      receiver: Address.fromBech32(receiverAddress),
      gasLimit: 500000,
      data: data as any,
      chainID: 'D',
    });

    return tx;
  }, [address, isAuthenticated, sdk.nonce]);

  return { transferESDT };
};

// Specialized hook for NFT operations
export const useNFTContract = () => {
  const sdk = useSdk();
  const address = sdk.address;
  const isAuthenticated = sdk.isAuthenticated;

  const transferNFT = useCallback(async (
    tokenIdentifier: string,
    nonce: number,
    receiverAddress: string
  ) => {
    if (!isAuthenticated || !address) {
      throw new Error('Wallet not connected');
    }

    // ESDTNFTTransfer@tokenID@nonce@quantity@destination
    const hexToken = toHex(tokenIdentifier);
    const hexNonce = nonce.toString(16).padStart(16, '0');
    const hexQuantity = '01'; // 1 NFT
    const destAddress = Address.fromBech32(receiverAddress);
    const hexReceiver = destAddress.hex(); // .hex is a property, not method
    
    const dataString = `ESDTNFTTransfer@${hexToken}@${hexNonce}@${hexQuantity}@${hexReceiver}`;
    const data = new TextEncoder().encode(dataString);

    const tx = new Transaction({
      nonce: sdk.nonce || 0,
      value: TokenTransfer.egldFromAmount(0), // 0 EGLD
      sender: Address.fromBech32(address),
      receiver: destAddress, // For NFT transfers, receiver is the same as sender, actual dest is in data
      gasLimit: 1000000,
      data: data as any,
      chainID: 'D',
    });

    return tx;
  }, [address, isAuthenticated, sdk.nonce]);

  return { transferNFT };
};
