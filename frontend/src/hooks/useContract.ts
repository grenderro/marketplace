// hooks/useContract.ts — Smart contract interaction hooks using sdk-dapp
import { useCallback } from 'react';
import {
  Address,
  Transaction,
  TokenTransfer
} from '@multiversx/sdk-core';
import {
  useGetAccountInfo,
  useGetLoginInfo,
} from '@multiversx/sdk-dapp/hooks';
import { CONTRACT_ADDRESS } from '../config';

const toHex = (str: string) => Buffer.from(str, 'utf-8').toString('hex');
const toHexU64 = (num: number) => num.toString(16).padStart(16, '0');
const toHexBigInt = (value: bigint) => value.toString(16).padStart(16, '0');

export const useMarketplaceContract = () => {
  const { address, account } = useGetAccountInfo();
  const { isLoggedIn } = useGetLoginInfo();

  const createListing = useCallback(async (
    tokenIdentifier: string,
    nonce: number,
    price: string
  ) => {
    if (!isLoggedIn || !address) {
      throw new Error('Wallet not connected');
    }

    const priceAtomic = BigInt(Math.floor(parseFloat(price) * 1e18));
    const dataString = `createListing@${toHex(tokenIdentifier)}@${toHexU64(nonce)}@${toHexBigInt(priceAtomic)}`;
    const data = new TextEncoder().encode(dataString);

    const value = TokenTransfer.egldFromAmount(0.05);

    const tx = new Transaction({
      nonce: account?.nonce || 0,
      value: value,
      sender: Address.fromBech32(address),
      receiver: Address.fromBech32(CONTRACT_ADDRESS),
      gasLimit: 10000000,
      data: data as any,
      chainID: 'D',
    });

    return tx;
  }, [address, isLoggedIn, account?.nonce]);

  const buyListing = useCallback(async (listingId: number, priceAmount: string, priceToken: string = 'EGLD') => {
    if (!isLoggedIn || !address) {
      throw new Error('Wallet not connected');
    }

    const dataString = `buyListing@${toHexU64(listingId)}`;
    const data = new TextEncoder().encode(dataString);

    const tx = new Transaction({
      nonce: account?.nonce || 0,
      value: priceToken === 'EGLD' ? TokenTransfer.egldFromAmount(parseFloat(priceAmount) / 1e18) : TokenTransfer.egldFromAmount(0),
      sender: Address.fromBech32(address),
      receiver: Address.fromBech32(CONTRACT_ADDRESS),
      gasLimit: 15000000,
      data: data as any,
      chainID: 'D',
    });

    return tx;
  }, [address, isLoggedIn, account?.nonce]);

  const cancelListing = useCallback(async (listingId: number) => {
    if (!isLoggedIn || !address) {
      throw new Error('Wallet not connected');
    }

    const dataString = `cancelListing@${toHexU64(listingId)}`;
    const data = new TextEncoder().encode(dataString);

    const tx = new Transaction({
      nonce: account?.nonce || 0,
      value: TokenTransfer.egldFromAmount(0),
      sender: Address.fromBech32(address),
      receiver: Address.fromBech32(CONTRACT_ADDRESS),
      gasLimit: 10000000,
      data: data as any,
      chainID: 'D',
    });

    return tx;
  }, [address, isLoggedIn, account?.nonce]);

  return {
    isReady: isLoggedIn,
    createListing,
    buyListing,
    cancelListing,
    address,
    isAuthenticated: isLoggedIn
  };
};

export const useESDTContract = () => {
  const { address, account } = useGetAccountInfo();
  const { isLoggedIn } = useGetLoginInfo();

  const transferESDT = useCallback(async (
    tokenIdentifier: string,
    amount: string,
    receiverAddress: string
  ) => {
    if (!isLoggedIn || !address) {
      throw new Error('Wallet not connected');
    }

    const hexToken = toHex(tokenIdentifier);
    const hexAmount = BigInt(amount).toString(16).padStart(16, '0');
    const dataString = `ESDTTransfer@${hexToken}@${hexAmount}`;
    const data = new TextEncoder().encode(dataString);

    const tx = new Transaction({
      nonce: account?.nonce || 0,
      value: TokenTransfer.egldFromAmount(0),
      sender: Address.fromBech32(address),
      receiver: Address.fromBech32(receiverAddress),
      gasLimit: 500000,
      data: data as any,
      chainID: 'D',
    });

    return tx;
  }, [address, isLoggedIn, account?.nonce]);

  return { transferESDT };
};

export const useNFTContract = () => {
  const { address, account } = useGetAccountInfo();
  const { isLoggedIn } = useGetLoginInfo();

  const transferNFT = useCallback(async (
    tokenIdentifier: string,
    nonce: number,
    receiverAddress: string
  ) => {
    if (!isLoggedIn || !address) {
      throw new Error('Wallet not connected');
    }

    const hexToken = toHex(tokenIdentifier);
    const hexNonce = nonce.toString(16).padStart(16, '0');
    const hexQuantity = '01';
    const destAddress = Address.fromBech32(receiverAddress);
    const hexReceiver = destAddress.hex();

    const dataString = `ESDTNFTTransfer@${hexToken}@${hexNonce}@${hexQuantity}@${hexReceiver}`;
    const data = new TextEncoder().encode(dataString);

    const tx = new Transaction({
      nonce: account?.nonce || 0,
      value: TokenTransfer.egldFromAmount(0),
      sender: Address.fromBech32(address),
      receiver: Address.fromBech32(address),
      gasLimit: 1000000,
      data: data as any,
      chainID: 'D',
    });

    return tx;
  }, [address, isLoggedIn, account?.nonce]);

  return { transferNFT };
};
