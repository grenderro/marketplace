import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Listing } from './Listing';

@Entity('collections')
export class Collection {
    @PrimaryColumn({ type: 'varchar', length: 100 })
    collection_id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    symbol: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'text', nullable: true, name: 'image_url' })
    imageUrl: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'creator_address', referencedColumnName: 'address' })
    creator: User;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'royalty_percent' })
    royaltyPercent: number;

    @Column({ type: 'int', default: 0, name: 'total_supply' })
    totalSupply: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @OneToMany(() => Listing, listing => listing.collection)
    listings: Listing[];
}
