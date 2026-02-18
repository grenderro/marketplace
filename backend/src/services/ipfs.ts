import { z } from 'zod';

const NFTMetadataSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  image: z.string().startsWith('ipfs://'),
});

export type ValidatedMetadata = z.infer<typeof NFTMetadataSchema>;

export class IPFSService {
  private static readonly GATEWAYS = [
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
  ];

  static async fetchMetadata(uri: string): Promise<ValidatedMetadata> {
    const hash = uri.replace('ipfs://', '');
    
    for (const gateway of this.GATEWAYS) {
      try {
        const response = await fetch(`${gateway}${hash}`);
        if (response.ok) return NFTMetadataSchema.parse(await response.json());
      } catch (e) { continue; }
    }
    throw new Error('Failed to fetch metadata');
  }
}
