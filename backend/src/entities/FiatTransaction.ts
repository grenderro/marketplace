import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Listing } from './Listing';

@Entity('fiat_transactions')
export class FiatTransaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Listing)
    @JoinColumn({ name: 'listing_id' })
    listing: Listing;

    @Column({ type: 'varchar', length: 62 })
    buyer_address: string;

    @Column({ type: 'varchar', length: 62 })
    seller_address: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    fiat_amount: string;

    @Column({ type: 'varchar', length: 3, default: 'USD' })
    fiat_currency: string;

    @Column({ type: 'decimal', precision: 36, scale: 18 })
    crypto_amount: string;

    @Column({ type: 'varchar', length: 20, default: 'pending' })
    status: 'pending' | 'completed' | 'disputed' | 'refunded';

    @Column({ type: 'varchar', length: 50, name: 'payment_provider' })
    paymentProvider: string;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'provider_transaction_id' })
    providerTransactionId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ type: 'timestamp', nullable: true, name: 'completed_at' })
    completedAt: Date;
}
