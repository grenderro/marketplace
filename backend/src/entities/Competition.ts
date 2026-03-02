import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('competitions')
export class Competition {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'timestamp' })
    start_date: Date;

    @Column({ type: 'timestamp' })
    end_date: Date;

    @Column({ type: 'decimal', precision: 36, scale: 18, default: 0, name: 'prize_pool' })
    prizePool: string;

    @Column({ type: 'varchar', length: 20, default: 'EGLD', name: 'prize_currency' })
    prizeCurrency: string;

    @Column({ type: 'varchar', length: 20, default: 'upcoming' })
    status: 'upcoming' | 'active' | 'ended';

    @Column({ type: 'jsonb', nullable: true })
    rules: object;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
