import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Collection } from './Collection';

@Entity('listings')
export class Listing {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    nft_id: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    collection_id: string;

    @ManyToOne(() => Collection, collection => collection.listings)
    @JoinColumn({ name: 'collection_id' })
    collection: Collection;

    @Column({ type: 'varchar', length: 62 })
    seller: string;

    @ManyToOne(() => User, user => user.listings)
    @JoinColumn({ name: 'seller', referencedColumnName: 'address' })
    sellerUser: User;

    @Column({ type: 'varchar', length: 62, nullable: true })
    buyer: string;

    @Column({ type: 'decimal', precision: 36, scale: 18 })
    price: string;

    @Column({ type: 'varchar', length: 20, default: 'EGLD' })
    currency: string;

    @Column({ type: 'varchar', length: 20, default: 'active' })
    status: 'active' | 'sold' | 'cancelled' | 'expired';

    @Column({ type: 'varchar', length: 20, default: 'fixed' })
    listing_type: 'fixed' | 'auction' | 'dutch';

    @Column({ type: 'varchar', length: 100, name: 'nft_id' })
    nftId: string;

    @Column({ name: 'collection_id' })
    collectionId: string;

    @Column({ type: 'timestamp', nullable: true, name: 'auction_end_time' })
    auctionEndTime: Date;

    @Column({ type: 'text', nullable: true, name: 'metadata_uri' })
    metadataUri: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column({ type: 'timestamp', nullable: true, name: 'sold_at' })
    soldAt: Date;

    @Column({ type: 'varchar', length: 100, nullable: true, name: 'transaction_hash' })
    transactionHash: string;
}
