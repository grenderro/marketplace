import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSdk } from '../../../components/stubs/SdkStubs';
import MarketplaceNav from '../../../components/marketplace/MarketplaceNav';
import { fetchAccountTransactions, TransactionItem } from '../../../services/multiversxApi';
import { getExplorerLink } from '../../../config';

interface HistoryEvent {
  txHash: string;
  type: 'Listed' | 'Bought' | 'Minted';
  label: string;
  timestamp: number;
  value: string;
}

type CategorizedType = HistoryEvent['type'] | 'Other';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || 'erd1qqqqqqqqqqqqqpgqmzpauhqppu707208j8zrjq8q7trpgw7yvhuqtjt9ev';

function categorizeTransaction(tx: TransactionItem, userAddress: string): CategorizedType {
  const data = tx.data || '';
  const decodedData = (() => {
    try {
      return atob(data);
    } catch {
      return '';
    }
  })();

  if (decodedData.includes('createListing') || decodedData.includes('createAuction')) return 'Listed';
  if (decodedData.includes('buyListing') || decodedData.includes('placeBid')) return 'Bought';
  if (decodedData.includes('ESDTNFTCreate')) return 'Minted';

  // Heuristic: if user sent NFT to marketplace contract
  if (tx.sender === userAddress && tx.receiver === CONTRACT_ADDRESS) {
    return 'Listed';
  }
  // Heuristic: if marketplace sent something to user
  if (tx.receiver === userAddress && tx.sender === CONTRACT_ADDRESS) {
    return 'Bought';
  }

  return 'Other';
}

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleString();
}

export default function History() {
  const sdk = useSdk();
  const isAuthenticated = sdk.isAuthenticated;
  const address = sdk.address;
  const [isMobile, setIsMobile] = useState(false);
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isAuthenticated && address) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, address]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const txs = await fetchAccountTransactions(address!, 50);
      const mapped: HistoryEvent[] = txs
        .map(tx => {
          const type = categorizeTransaction(tx, address!);
          if (type === 'Other') return null;

          let label = '';
          switch (type) {
            case 'Listed':
              label = 'Listed an NFT';
              break;
            case 'Bought':
              label = 'Bought an NFT';
              break;
            case 'Minted':
              label = 'Minted a new NFT';
              break;
          }

          return {
            txHash: tx.txHash,
            type,
            label,
            timestamp: tx.timestamp,
            value: tx.value
          };
        })
        .filter((e): e is HistoryEvent => e !== null);

      setEvents(mapped);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const typeColors: Record<HistoryEvent['type'], { bg: string; border: string; color: string }> = {
    Listed: { bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.3)', color: '#00d4ff' },
    Bought: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', color: '#22c55e' },
    Minted: { bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)', color: '#a855f7' }
  };

  return (
    <div className="min-h-screen" style={{ background: '#0f172a' }}>
      <MarketplaceNav />

      <div style={{
        padding: isMobile ? '2rem 1rem' : '3rem 2rem',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, transparent 50%, rgba(168,85,247,0.1) 100%)'
      }}>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: isMobile ? '2rem' : '3rem',
            fontWeight: 800,
            marginBottom: '1rem',
            color: '#fff',
            lineHeight: 1.2
          }}
        >
          My <span style={{ color: '#00d4ff' }}>History</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            color: '#94a3b8',
            fontSize: isMobile ? '1rem' : '1.25rem',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: 1.6
          }}
        >
          NFTs bought, sold, and minted by your wallet.
        </motion.p>
      </div>

      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: isMobile ? '1rem 0.5rem' : '2rem'
      }}>
        {!isAuthenticated ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Wallet Not Connected</h3>
            <p>Please connect your wallet to view your history.</p>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(0, 212, 255, 0.1)',
              borderTop: '3px solid #00d4ff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            Loading history...
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No History Found</h3>
            <p>No marketplace activity detected for this wallet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {events.map((event, i) => {
              const colors = typeColors[event.type];
              return (
                <div
                  key={event.txHash + i}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    padding: isMobile ? '1rem' : '1.25rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    gap: isMobile ? '0.75rem' : '1rem'
                  }}
                >
                  <span style={{
                    padding: '0.35rem 0.85rem',
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '20px',
                    color: colors.color,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap'
                  }}>
                    {event.type}
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>
                      {event.label}
                    </p>
                    <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                      {formatDate(event.timestamp)}
                    </p>
                  </div>

                  <a
                    href={getExplorerLink('transaction', event.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#00d4ff',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    View Tx ↗
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
