// backend/src/repositories/ListingRepository.ts
import { listingRepository } from '../data-source';
import { Listing } from '../entities/Listing';

export class ListingRepository {
    private repo = listingRepository();

    async findActiveWithFilters(filters: {
        collectionId?: string;
        minPrice?: number;
        maxPrice?: number;
        seller?: string;
        limit?: number;
        offset?: number;
    }) {
        const query = this.repo
            .createQueryBuilder('listing')
            .leftJoinAndSelect('listing.collection', 'collection')
            .where('listing.status = :status', { status: 'active' });

        if (filters.collectionId) {
            query.andWhere('listing.collection_id = :collectionId', { 
                collectionId: filters.collectionId 
            });
        }

        if (filters.minPrice) {
            query.andWhere('listing.price >= :minPrice', { minPrice: filters.minPrice });
        }

        if (filters.maxPrice) {
            query.andWhere('listing.price <= :maxPrice', { maxPrice: filters.maxPrice });
        }

        if (filters.seller) {
            query.andWhere('listing.seller = :seller', { seller: filters.seller });
        }

        return await query
            .orderBy('listing.createdAt', 'DESC')
            .skip(filters.offset || 0)
            .take(filters.limit || 20)
            .getMany();
    }

    async getMarketStats() {
        return await this.repo
            .createQueryBuilder('listing')
            .select([
                'COUNT(CASE WHEN listing.status = :active THEN 1 END) as active_count',
                'COUNT(CASE WHEN listing.status = :sold THEN 1 END) as sold_count',
                'AVG(CASE WHEN listing.status = :sold THEN listing.price END) as avg_sale_price'
            ])
            .setParameters({ active: 'active', sold: 'sold' })
            .getRawOne();
    }
}
