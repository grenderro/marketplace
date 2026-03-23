// src/utils/blockchain.ts
const API_URL = 'https://devnet-api.multiversx.com';

export const getAccountBalance = async (address: string) => {
  const res = await fetch(`${API_URL}/accounts/${address}`);
  const data = await res.json();
  return data.balance / 10**18; // Convert from smallest unit
};

export const getAccountNonce = async (address: string) => {
  const res = await fetch(`${API_URL}/accounts/${address}`);
  const data = await res.json();
  return data.nonce;
};
