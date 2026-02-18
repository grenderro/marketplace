// test.ts
import { ProxyNetworkProvider, Address } from '@multiversx/sdk-core';

const provider = new ProxyNetworkProvider('https://devnet-gateway.multiversx.com');
const addr = Address.newFromBech32('erd1qqqqqqqqqqqqqpgqmzpauhqppu707208j8zrjq8q7trpgw7yvhuqtjt9ev');

console.log('✅ SDK Core imports working!');
console.log('Contract address:', addr.toBech32());
