// server/websocket/marketplaceStream.ts
import { WebSocketServer, WebSocket } from 'ws';
import { nftAggregator } from '../aggregator/nftAggregator';

export class MarketplaceStream {
  private wss: WebSocketServer;
  private clients: Map<string, Set<WebSocket>> = new Map();

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.setupHandlers();
    this.startPolling();
  }

  private setupHandlers() {
    this.wss.on('connection', (ws: WebSocket) => {
      ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        
        switch (msg.action) {
          case 'subscribe':
            // Subscribe to specific collections or filters
            const key = msg.filter || 'all';
            if (!this.clients.has(key)) {
              this.clients.set(key, new Set());
            }
            this.clients.get(key)!.add(ws);
            break;
            
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong' }));
            break;
        }
      });

      ws.on('close', () => {
        // Remove from all subscriptions
        this.clients.forEach((set) => set.delete(ws));
      });
    });
  }

  private startPolling() {
    // Poll for new listings every 10 seconds
    setInterval(async () => {
      const newListings = await this.checkForNewListings();
      
      if (newListings.length > 0) {
        this.broadcast('all', {
          type: 'new_listings',
          data: newListings,
        });
        
        // Also broadcast to collection-specific subscribers
        newListings.forEach((listing: any) => {
          this.broadcast(listing.collection, {
            type: 'new_listing',
            data: listing,
          });
        });
      }
    }, 10000);
  }

  private async checkForNewListings() {
    // Implementation to detect new listings since last check
    return [];
  }

  private broadcast(key: string, message: any) {
    const clients = this.clients.get(key);
    if (!clients) return;

    const deadClients: WebSocket[] = [];
    
    clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      } else {
        deadClients.push(ws);
      }
    });

    // Cleanup dead connections
    deadClients.forEach((ws) => clients.delete(ws));
  }
}
