import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Listing } from './Listing';

@Entity('users')
export class User {
    @PrimaryColumn({ type: 'varchar', length: 62 })
    address: string;

    @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
    username: string;

    @Column({ type: 'text', nullable: true })
    bio: string;

    @Column({ type: 'text', nullable: true, name: 'avatar_url' })
    avatarUrl: string;

    @Column({ type: 'int', default: 0, name: 'reputation_score' })
    reputationScore: number;

    @Column({ type: 'boolean', default: false, name: 'is_verified' })
    isVerified: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ type: 'timestamp', nullable: true, name: 'last_active' })
    lastActive: Date;

    @OneToMany(() => Listing, listing => listing.sellerUser)
    listings: Listing[];
}
