// backend/src/index.ts
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';
import analyticsRoutes from './routes/analytics';
import authRoutes from './routes/auth';
import { setupWebSocketServer } from './websocket-server';
import { blockchainListener } from './services/blockchainEvents';

dotenv.config();

// Validate critical environment variables
const requiredEnv = ['JWT_SECRET', 'DB_PASSWORD', 'DB_USERNAME'];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('   Please copy .env.example to .env and fill in your values.');
    process.exit(1);
}

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database and start server
AppDataSource.initialize().then(() => {
        console.log('📊 Database connected successfully');
        
        // Routes
        app.use('/api/analytics', analyticsRoutes);
        app.use('/api/auth', authRoutes);
        
        // Health check
        app.get('/health', async (req, res) => {
            res.json({ 
                status: 'healthy', 
                database: 'connected',
                timestamp: new Date().toISOString()
            });
        });
        
// Start HTTP server
const server = app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    
    // Start blockchain listener
    try {
        await blockchainListener.startListening();
    } catch (err) {
        console.error('Failed to start blockchain listener:', err);
    }
});

// Setup WebSocket
setupWebSocketServer(server);
        
    })
    .catch((error) => {
        console.error('❌ Error during Data Source initialization:', error);
        process.exit(1);
    });

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing connections...');
    await AppDataSource.destroy();
    process.exit(0);
});
process.on('uncaughtException', (err) => {
    console.error('FATAL Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Mock data endpoints (replace with real DB queries later)
app.get('/api/analytics/global', (req, res) => {
  res.json({
    totalVolume: '1250.5',
    totalListings: 42,
    activeUsers: 18,
    feesGenerated: '12.5',
    volumeHistory: [12, 19, 15, 25, 22, 30, 28]
  });
});

app.get('/api/analytics/leaderboard', (req, res) => {
  res.json([
    { address: 'erd1...user1', volume: '450.2' },
    { address: 'erd1...user2', volume: '320.1' },
    { address: 'erd1...user3', volume: '180.5' }
  ]);
});

app.get('/api/listings', (req, res) => {
  res.json({
    data: {
      listings: [],
      hasMore: false
    }
  });
});
