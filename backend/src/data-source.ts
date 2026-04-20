import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Listing } from './entities/Listing';
import { User } from './entities/User';
import { Collection } from './entities/Collection';
import { Competition } from './entities/Competition';
import { FiatTransaction } from './entities/FiatTransaction';
import { SocialInteraction } from './entities/SocialInteraction';
import { InitialSchema1771940153000 } from './migrations/1771940153000-InitialSchema';

dotenv.config();

if (!process.env.DB_PASSWORD) {
    throw new Error('DB_PASSWORD environment variable is required. See .env.example');
}

if (!process.env.DB_USERNAME) {
    throw new Error('DB_USERNAME environment variable is required. See .env.example');
}

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'trad3ex',
    synchronize: false, // NEVER true in production—use migrations only
    logging: process.env.NODE_ENV === 'development',
    entities: [User, Collection, Listing, Competition, FiatTransaction, SocialInteraction],
    migrations: [InitialSchema1771940153000],
    subscribers: [],
});

// Export repositories for easy access
export const userRepository = () => AppDataSource.getRepository(User);
export const collectionRepository = () => AppDataSource.getRepository(Collection);
export const listingRepository = () => AppDataSource.getRepository(Listing);
export const competitionRepository = () => AppDataSource.getRepository(Competition);
export const fiatTransactionRepository = () => AppDataSource.getRepository(FiatTransaction);
export const socialInteractionRepository = () => AppDataSource.getRepository(SocialInteraction);
