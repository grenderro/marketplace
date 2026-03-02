import { Transaction } from '@multiversx/sdk-core';

export const getNonce = async (address: string): Promise<number> => {
  // Implement actual nonce fetching from API
  const res = await fetch(`https://devnet-api.multiversx.com/accounts/${address}/nonce`);
  const data = await res.json();
  return data.nonce;
};

export const sendTransaction = async (tx: Transaction) => {
  // Implement signing and sending via sdk-dapp
  // This is a placeholder - use actual sdk-dapp methods
  console.log('Sending transaction:', tx);
};

export const parseAmount = (amount: string): bigint => {
  return BigInt(parseFloat(amount) * 10**18);
};
