// components/NotificationCenter.tsx
import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationCenter: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    isConnected, 
    markAsRead, 
    clearAll 
  } = useNotifications();
  const [isOpen, setIsOpen] = React.useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'sale': return '💰';
      case 'bid': return '🔨';
      case 'offer': return '💌';
      case 'outbid': return '⚠️';
      case 'auction_end': return '⏰';
      case 'price_drop': return '📉';
      default: return '📢';
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-xs font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        
        {/* Connection Status */}
        <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-96 bg-[#12121a] border border-gray-800 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden z-50"
          >
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-white">Notifications</h3>
              <div className="flex gap-2">
                <button 
                  onClick={clearAll}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Clear all
                </button>
                <button 
                  onClick={() => Notification.requestPermission()}
                  className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                  Enable Push
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-2">🔔</div>
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification, idx) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 border-b border-gray-800 hover:bg-[#1a1a25] cursor-pointer transition-colors ${
                      !notification.read ? 'bg-cyan-400/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className="text-2xl">{getIcon(notification.type)}</span>
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-sm">{notification.title}</h4>
                        <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-600 mt-2">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-cyan-400 rounded-full mt-2" />
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
