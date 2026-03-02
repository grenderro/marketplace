// hooks/useNotifications.ts
import { useEffect, useState, useCallback } from 'react';
import { useGetAccountInfo } from './sdkStubs';

interface Notification {
  id: string;
  type: 'sale' | 'bid' | 'offer' | 'auction_end' | 'price_drop' | 'outbid';
  title: string;
  message: string;
  data: any;
  timestamp: number;
  read: boolean;
}

export const useNotifications = () => {
  const { address } = useGetAccountInfo();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!address) return;

    const ws = new WebSocket(`wss://api.yourmarketplace.com/ws?address=${address}`);
    
    ws.onopen = () => {
      setIsConnected(true);
      // Subscribe to user's collections
      ws.send(JSON.stringify({ action: 'subscribe', channel: 'user_updates' }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'notification':
          setNotifications(prev => [message.data, ...prev]);
          setUnreadCount(prev => prev + 1);
          showBrowserNotification(message.data);
          break;
        
        case 'unread_notifications':
          setNotifications(message.data);
          setUnreadCount(message.data.filter((n: Notification) => !n.read).length);
          break;
        
        case 'broadcast':
          // Handle price drops, trending, etc.
          break;
      }
    };

    ws.onclose = () => setIsConnected(false);
    
    setSocket(ws);

    return () => ws.close();
  }, [address]);

  const markAsRead = useCallback((notificationId: string) => {
    socket?.send(JSON.stringify({ action: 'mark_read', notificationId }));
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [socket]);

  const subscribeToCollection = useCallback((collectionId: string) => {
    socket?.send(JSON.stringify({ action: 'subscribe_collection', collectionId }));
  }, [socket]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    subscribeToCollection,
    clearAll
  };
};

// Browser notification helper
const showBrowserNotification = (notification: Notification) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/logo.png',
      badge: '/badge.png',
      tag: notification.id,
      requireInteraction: notification.type === 'auction_end'
    });
  }
};
