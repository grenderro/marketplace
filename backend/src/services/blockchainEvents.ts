import { AppDataSource } from '../data-source';
import { Listing } from '../entities/Listing';
import { User } from '../entities/User';
import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers';

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || 'erd1qqqqqqqqqqqqqpgqmzpauhqppu707208j8zrjq8q7trpgw7yvhuqtjt9ev';
const NETWORK_PROVIDER = process.env.NETWORK_PROVIDER || 'https://devnet-gateway.multiversx.com';
const POLL_INTERVAL = 30000; // 30 seconds for devnet (less spam)

export class BlockchainEventListener {
    private provider: ProxyNetworkProvider;
    private listingRepo = AppDataSource.getRepository(Listing);
    private userRepo = AppDataSource.getRepository(User);
    private lastCheckedTimestamp = Math.floor(Date.now() / 1000) - 3600;
    
    constructor() {
        this.provider = new ProxyNetworkProvider(NETWORK_PROVIDER, { clientName: 'trad3ex-backend' });
    }

    async startListening() {
        console.log('🔊 Blockchain event listener started');
        console.log(`📍 Contract: ${CONTRACT_ADDRESS}`);
        console.log(`⏱️  Polling every ${POLL_INTERVAL/1000}s`);
        
        await this.syncEvents();
        setInterval(() => this.syncEvents(), POLL_INTERVAL);
    }

    private async syncEvents() {
    try {
        // Use correct MultiversX API format
        const url = `https://devnet-api.multiversx.com/accounts/${CONTRACT_ADDRESS}/transactions?size=10&after=${this.lastCheckedTimestamp}`;
        
        console.log('Fetching:', url);
        
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
            const text = await response.text();
            console.error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
            return;
        }
        
        const data: any = await response.json();
        const transactions = Array.isArray(data) ? data : (data.transactions || []);
        
        if (transactions.length === 0) {
            console.log('No new transactions');
            return;
        }
        
        console.log(`📥 ${transactions.length} new transactions`);
        
        for (const tx of transactions) {
            if (tx.status === 'success' && tx.txHash) {
                await this.processTransaction(tx);
            }
            if (tx.timestamp > this.lastCheckedTimestamp) {
                this.lastCheckedTimestamp = tx.timestamp;
            }
        }
    } catch (error: any) {
        console.error('❌ Sync error:', error.message);
    }
}

    private async processTransaction(tx: any) {
        const existing = await this.listingRepo.findOne({
            where: { transactionHash: tx.txHash }
        });
        if (existing) return;

        let data = '';
        try {
            data = Buffer.from(tx.data, 'base64').toString();
        } catch (e) {
            data = tx.data || '';
        }

        // Simple detection based on your contract methods
        if (data.includes('ESDTTransfer') && data.includes('createListing')) {
            await this.handleCreateListing(tx, data);
        } else if (data.includes('buy') || tx.receiver === CONTRACT_ADDRESS) {
            await this.handlePurchase(tx);
        }
    }

    private async handleCreateListing(tx: any, data: string) {
        try {
            let seller = await this.userRepo.findOne({ where: { address: tx.sender } });
            if (!seller) {
                seller = this.userRepo.create({ address: tx.sender });
                await this.userRepo.save(seller);
            }

            const listing = this.listingRepo.create({
                nft_id: `nft-${tx.txHash.substring(0, 8)}`,
                seller: tx.sender,
                price: tx.value?.toString() || '0',
                currency: 'EGLD',
                status: 'active',
                listing_type: 'fixed',
                transactionHash: tx.txHash,
                createdAt: new Date(tx.timestamp * 1000)
            });

            await this.listingRepo.save(listing);
            console.log(`✅ New listing: ${listing.id}`);
            
        } catch (error: any) {
            console.error('❌ Save error:', error.message);
        }
    }

    private async handlePurchase(tx: any) {
        try {
            const listing = await this.listingRepo.findOne({
                where: { status: 'active' },
                order: { createdAt: 'DESC' }
            });

            if (listing) {
                listing.status = 'sold';
                listing.buyer = tx.sender;
                listing.soldAt = new Date(tx.timestamp * 1000);
                await this.listingRepo.save(listing);
                console.log(`💰 Sale: ${listing.id}`);
            }
        } catch (error: any) {
            console.error('❌ Purchase error:', error.message);
        }
    }
}

export const blockchainListener = new BlockchainEventListener();
