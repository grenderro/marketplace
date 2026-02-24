// utils/metadataParser.ts
import { z } from 'zod';

const AttributeSchema = z.object({
  trait_type: z.string(),
  value: z.union([z.string(), z.number()]),
  display_type: z.enum(['number', 'boost_number', 'boost_percentage', 'date']).optional(),
});

const NFTMetadataSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  image: z.string().startsWith('ipfs://'),
  attributes: z.array(AttributeSchema).max(100).optional(),
  external_url: z.string().url().optional(),
  animation_url: z.string().startsWith('ipfs://').optional(),
  background_color: z.string().regex(/^[0-9a-fA-F]{6}$/).optional(),
});

export type ValidatedMetadata = z.infer<typeof NFTMetadataSchema>;

export class MetadataParser {
  static validate(metadata: unknown): ValidatedMetadata {
    return NFTMetadataSchema.parse(metadata);
  }

  static sanitize(metadata: any): Partial<ValidatedMetadata> {
    // Remove potentially malicious fields
    const allowedKeys = ['name', 'description', 'image', 'attributes', 'external_url', 'animation_url', 'background_color'];
    return Object.keys(metadata)
      .filter(key => allowedKeys.includes(key))
      .reduce((obj, key) => ({ ...obj, [key]: metadata[key] }), {});
  }

  static formatAttributes(attributes: any[]): string[] {
    if (!Array.isArray(attributes)) return [];
    
    return attributes
      .filter(attr => attr.trait_type && attr.value !== undefined)
      .map(attr => `${attr.trait_type}: ${attr.value}`);
  }

  static calculateRarityScore(attributes: any[], collectionTraits: Map<string, Map<string, number>>): number {
    if (!attributes || !collectionTraits) return 0;
    
    let score = 0;
    for (const attr of attributes) {
      const traitCounts = collectionTraits.get(attr.trait_type);
      if (traitCounts) {
        const count = traitCounts.get(String(attr.value)) || 1;
        const total = Array.from(traitCounts.values()).reduce((a, b) => a + b, 0);
        score += 1 / (count / total);
      }
    }
    return score;
  }
}
