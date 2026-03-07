import { useCallback } from 'react';
import { 
  Address, 
  Transaction, 
  TransactionPayload, 
  TokenTransfer
} from '@multiversx/sdk-core';
import { useSdk } from '../components/stubs/SdkStubs';
import { CONTRACT_ADDRESS, CHAIN_ID } from '../config';

export const useRealMarketplaceContract = () => {
  const { address, isAuthenticated, sendTransaction } = useSdk();

  const createListing = useCallback(async (
    tokenIdentifier: string,
    nonce: number,
    price: string,
    quantity: number = 1
  ) => {
    if (!isAuthenticated || !address) {
      throw new Error('Wallet not connected');
    }

    const data = new TransactionPayload(
      `createListing@` +
      `${Buffer.from(tokenIdentifier).toString('hex')}@` +
      `${nonce.toString(16)}@` +
      `${quantity.toString(16)}@` +
      `${BigInt(Math.floor(parseFloat(price) * 1e18)).toString(16)}`
    );

    const tx = new Transaction({
      nonce: 0,
      value: TokenTransfer.egldFromAmount(0),
      sender: Address.fromBech32(address),
      receiver: Address.fromBech32(CONTRACT_ADDRESS),
      gasLimit: 10000000,
      data,
      chainID: CHAIN_ID,
    });

    return await sendTransaction(tx);
  }, [isAuthenticated, address, sendTransaction]);

  // ... other functions
  return {
    isAuthenticated,
    address,
    contractAddress: CONTRACT_ADDRESS,
    createListing,
  };
};

export default useRealMarketplaceContract;
