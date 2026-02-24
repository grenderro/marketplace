// services/ipfs.ts
import { create } from 'ipfs-http-client';
import { PinataSDK } from 'pinata-web3';

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: 'https://gateway.pinata.cloud',
});

const ipfs = create({
  url: process.env.IPFS_NODE_URL || 'https://ipfs.infura.io:5001',
});

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
  external_url?: string;
  animation_url?: string;
  background_color?: string;
}

export class IPFSService {
  // Upload image to IPFS
  static async uploadImage(file: Buffer | File, filename: string): Promise<string> {
    // Upload to Pinata for persistence
    const pinataResponse = await pinata.upload.file(file, {
      metadata: { name: filename },
    });
    
    return `ipfs://${pinataResponse.IpfsHash}`;
  }

  // Upload metadata JSON
  static async uploadMetadata(metadata: NFTMetadata): Promise<string> {
    const pinataResponse = await pinata.upload.json(metadata, {
      metadata: { name: `${metadata.name}_metadata.json` },
    });
    
    return `ipfs://${pinataResponse.IpfsHash}`;
  }

  // Fetch metadata from IPFS
  static async fetchMetadata(uri: string): Promise<NFTMetadata> {
    const hash = uri.replace('ipfs://', '');
    
    // Try Pinata gateway first
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.log('Pinata fetch failed, trying fallback...');
    }

    // Fallback to public gateway
    const response = await fetch(`https://ipfs.io/ipfs/${hash}`);
    if (!response.ok) throw new Error('Failed to fetch metadata');
    
    return await response.json();
  }

  // Batch fetch with caching
  static async batchFetchMetadata(uris: string[]): Promise<Map<string, NFTMetadata>> {
    const results = new Map();
    const cache = await this.getMetadataCache();
    
    const toFetch = uris.filter(uri => !cache.has(uri));
    
    // Fetch in batches of 10
    for (let i = 0; i < toFetch.length; i += 10) {
      const batch = toFetch.slice(i, i + 10);
      const promises = batch.map(async (uri) => {
        try {
          const data = await this.fetchMetadata(uri);
          cache.set(uri, data);
          results.set(uri, data);
        } catch (e) {
          console.error(`Failed to fetch ${uri}:`, e);
        }
      });
      
      await Promise.all(promises);
      // Rate limit delay
      await new Promise(r => setTimeout(r, 100));
    }

    // Add cached results
    for (const uri of uris) {
      if (cache.has(uri) && !results.has(uri)) {
        results.set(uri, cache.get(uri));
      }
    }

    await this.saveMetadataCache(cache);
    return results;
  }

  // Cache management
  private static async getMetadataCache(): Promise<Map<string, NFTMetadata>> {
    // Implementation with AsyncStorage (mobile) or localStorage (web)
    return new Map();
  }

  private static async saveMetadataCache(cache: Map<string, NFTMetadata>) {
    // Implementation
  }

  // Image optimization
  static getOptimizedImageUrl(ipfsUri: string, width: number = 400): string {
    const hash = ipfsUri.replace('ipfs://', '');
    
    // Use Pinata's image optimization
    return `https://gateway.pinata.cloud/ipfs/${hash}?img-width=${width}`;
  }
}
