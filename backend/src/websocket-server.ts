// backend/src/websocket-server.ts
import { Server } from 'http';
import WebSocket from 'ws';
import { AppDataSource } from './data-source';
import { listingRepository } from './data-source';

export function setupWebSocketServer(server: Server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('New WebSocket connection');

        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message.toString());
                
                switch (data.type) {
                    case 'subscribe_listings':
                        // Subscribe to new listings
                        ws.send(JSON.stringify({
                            type: 'subscribed',
                            channel: 'listings'
                        }));
                        break;
                    
                    case 'subscribe_price':
                        // Subscribe to price updates for specific NFT
                        ws.send(JSON.stringify({
                            type: 'subscribed',
                            channel: `price:${data.nftId}`
                        }));
                        break;
                    
                    case 'ping':
                        ws.send(JSON.stringify({ type: 'pong' }));
                        break;
                    
                    default:
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'Unknown message type'
                        }));
                }
            } catch (error) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Invalid message format'
                }));
            }
        });

        ws.on('close', () => {
            console.log('WebSocket disconnected');
        });

        // Send initial connection success
        ws.send(JSON.stringify({
            type: 'connected',
            message: 'WebSocket server connected'
        }));
    });

    // Broadcast to all connected clients
    (global as any).broadcastToClients = (data: any) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    };

    console.log('✅ WebSocket server initialized');
    return wss;
}

// Helper to broadcast events from other parts of the app
export function broadcastEvent(eventType: string, payload: any) {
    if ((global as any).broadcastToClients) {
        (global as any).broadcastToClients({
            type: eventType,
            data: payload,
            timestamp: new Date().toISOString()
        });
    }
}

export default setupWebSocketServer;
