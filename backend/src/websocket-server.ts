// backend/src/websocket-server.ts
import { WebSocketServer, WebSocket } from 'ws';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import { Address } from '@multiversx/sdk-core';

// Import network provider separately (it may be in a different submodule)
import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers';

interface Notification {
  id: string;
  type: 'sale' | 'bid' | 'offer' | 'auction_end' | 'price_drop' | 'outbid';
  userAddress: string;
  title: string;
  message: string;
  data: any;
  timestamp: number;
  read: boolean;
}

export default class MarketplaceWebSocketServer {
  private wss: WebSocketServer;
  private redis: Redis;
  private clients: Map<string, WebSocket> = new Map();
  private provider: ProxyNetworkProvider;
  private contractAddress: Address;

  constructor(port: number) {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.provider = new ProxyNetworkProvider(process.env.GATEWAY_URL || 'https://devnet-gateway.multiversx.com');
    // FIX: Use fromBech32 instead of newFromBech32
    this.contractAddress = Address.fromBech32(process.env.CONTRACT_ADDRESS || 'erd1qqqqqqqqqqqqqpgqmzpauhqppu707208j8zrjq8q7trpgw7yvhuqtjt9ev');
    this.wss = new WebSocketServer({ port });
    
    this.setupWebSocket();
    console.log(`🔌 WebSocket server started on port ${port}`);
  }

  private setupWebSocket() {
    this.wss.on('connection', async (ws: WebSocket, req) => {
      try {
        const userAddress = this.extractAddressFromUrl(req.url);
        
        if (!userAddress) {
          ws.close(1008, 'Invalid authentication');
          return;
        }

        this.clients.set(userAddress, ws);
        ws.send(JSON.stringify({ type: 'connected', address: userAddress }));

        ws.on('close', () => {
          this.clients.delete(userAddress);
        });
      } catch (error) {
        ws.close(1011, 'Internal error');
      }
    });
  }

  private extractAddressFromUrl(url?: string): string | null {
    if (!url) return null;
    try {
      const params = new URLSearchParams(url.split('?')[1]);
      const token = params.get('token');
      if (!token) return null;
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { address: string };
      return decoded.address;
    } catch {
      return null;
    }
  }
}
