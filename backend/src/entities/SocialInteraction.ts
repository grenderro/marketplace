import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('social_interactions')
export class SocialInteraction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 62, name: 'user_address' })
    userAddress: string;

    @Column({ type: 'varchar', length: 20, name: 'target_type' })
    targetType: 'listing' | 'user' | 'collection';

    @Column({ type: 'varchar', length: 100, name: 'target_id' })
    targetId: string;

    @Column({ type: 'varchar', length: 20, name: 'interaction_type' })
    interactionType: 'like' | 'report' | 'follow';

    @Column({ type: 'jsonb', nullable: true })
    metadata: object;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
