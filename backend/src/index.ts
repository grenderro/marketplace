import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import MarketplaceWebSocketServer from './websocket-server';
import analyticsRouter from './routes/analytics';
import authRouter from './routes/auth';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = Number(process.env.PORT) || 3000;
const WS_PORT = Number(process.env.WS_PORT) || 8080;

// CORS for frontend
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/analytics', analyticsRouter);
app.use('/api/auth', authRouter);
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// FIX: Use proper TypeScript syntax
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HTTP API: http://0.0.0.0:${PORT}`);
});

const wsServer = new MarketplaceWebSocketServer(WS_PORT);
console.log(`🔌 WebSocket: ws://0.0.0.0:${WS_PORT}`);
