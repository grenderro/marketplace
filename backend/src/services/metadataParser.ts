import { z } from 'zod';

const NFTMetadataSchema = z.object({
  name: z.string(),
  image: z.string().startsWith('ipfs://'),
});

export class MetadataParser {
  static validate(metadata: unknown) {
    return NFTMetadataSchema.parse(metadata);
  }
}
