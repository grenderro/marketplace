import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1771940153000 implements MigrationInterface {
    name = 'InitialSchema1771940153000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable UUID extension
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        
        // Users table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS users (
                address VARCHAR(62) PRIMARY KEY,
                username VARCHAR(50) UNIQUE,
                bio TEXT,
                avatar_url TEXT,
                reputation_score INTEGER DEFAULT 0,
                is_verified BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Collections table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS collections (
                collection_id VARCHAR(100) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                symbol VARCHAR(20),
                description TEXT,
                image_url TEXT,
                creator_address VARCHAR(62) REFERENCES users(address),
                royalty_percent DECIMAL(5,2) DEFAULT 0,
                total_supply INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Listings table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS listings (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                nft_id VARCHAR(100) NOT NULL,
                collection_id VARCHAR(100) REFERENCES collections(collection_id),
                seller VARCHAR(62) NOT NULL REFERENCES users(address),
                buyer VARCHAR(62) REFERENCES users(address),
                price DECIMAL(36,18) NOT NULL,
                currency VARCHAR(20) DEFAULT 'EGLD',
                status VARCHAR(20) DEFAULT 'active',
                listing_type VARCHAR(20) DEFAULT 'fixed',
                auction_end_time TIMESTAMP,
                metadata_uri TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                sold_at TIMESTAMP,
                transaction_hash VARCHAR(100)
            )
        `);

        // Competitions table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS competitions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(255) NOT NULL,
                description TEXT,
                start_date TIMESTAMP NOT NULL,
                end_date TIMESTAMP NOT NULL,
                prize_pool DECIMAL(36,18) DEFAULT 0,
                prize_currency VARCHAR(20) DEFAULT 'EGLD',
                status VARCHAR(20) DEFAULT 'upcoming',
                rules JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Fiat transactions table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS fiat_transactions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                listing_id UUID REFERENCES listings(id),
                buyer_address VARCHAR(62) REFERENCES users(address),
                seller_address VARCHAR(62) REFERENCES users(address),
                fiat_amount DECIMAL(10,2),
                fiat_currency VARCHAR(3) DEFAULT 'USD',
                crypto_amount DECIMAL(36,18),
                status VARCHAR(20) DEFAULT 'pending',
                payment_provider VARCHAR(50),
                provider_transaction_id VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP
            )
        `);

        // Social interactions table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS social_interactions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_address VARCHAR(62) REFERENCES users(address),
                target_type VARCHAR(20),
                target_id VARCHAR(100),
                interaction_type VARCHAR(20),
                metadata JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_address, target_type, target_id, interaction_type)
            )
        `);

        // Indexes
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_listings_buyer ON listings(buyer)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_listings_collection ON listings(collection_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_listings_nft ON listings(nft_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_listings_sold_time ON listings(status, created_at) WHERE status = 'sold'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS social_interactions`);
        await queryRunner.query(`DROP TABLE IF EXISTS fiat_transactions`);
        await queryRunner.query(`DROP TABLE IF EXISTS competitions`);
        await queryRunner.query(`DROP TABLE IF EXISTS listings`);
        await queryRunner.query(`DROP TABLE IF EXISTS collections`);
        await queryRunner.query(`DROP TABLE IF EXISTS users`);
    }
}
