import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSdk } from '../../../components/stubs/SdkStubs';
import MarketplaceNav from '../../../components/marketplace/MarketplaceNav';

interface Token {
  id: string;
  ticker: string;
  name: string;
  price: string;
  change24h: string;
  volume: string;
  marketCap: string;
}

export default function ESDTMarketplace() {
  const { isAuthenticated } = useSdk();
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mockTokens: Token[] = [
    { id: '1', ticker: 'LKMEX', name: 'Locked MEX', price: '0.0002', change24h: '+5.2%', volume: '2.4M', marketCap: '45M' },
    { id: '2', ticker: 'RIDE', name: 'Holoride', price: '0.05', change24h: '-2.1%', volume: '1.1M', marketCap: '12M' },
    { id: '3', ticker: 'ITHEUM', name: 'Itheum', price: '0.08', change24h: '+12.5%', volume: '800K', marketCap: '8M' },
    { id: '4', ticker: 'ZPAY', name: 'ZoidPay', price: '0.12', change24h: '+3.4%', volume: '600K', marketCap: '15M' },
    { id: '5', ticker: 'CRT', name: 'Cantina Royale', price: '0.003', change24h: '-5.6%', volume: '300K', marketCap: '3M' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#0f172a' }}>
      <MarketplaceNav />
      
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: isMobile ? '1rem 0.5rem' : '2rem'
      }}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            padding: isMobile ? '0 0.5rem' : 0
          }}
        >
          <h1 style={{ 
            fontSize: isMobile ? '1.75rem' : '2.5rem', 
            fontWeight: 800, 
            marginBottom: '0.5rem',
            color: '#fff'
          }}>
            ESDT <span style={{ color: '#00d4ff' }}>Tokens</span>
          </h1>
          <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
            Trade MultiversX Standard Digital Tokens
          </p>
        </motion.div>

        {/* Search */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: isMobile ? '0.75rem' : '1rem',
          border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <span style={{ color: '#64748b', fontSize: '1.25rem' }}>🔍</span>
            <input
              type="text"
              placeholder="Search tokens by name or ticker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  padding: 0
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Token List */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden'
        }}>
          {/* Header Row - Hidden on mobile */}
          {!isMobile && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px',
              padding: '1rem 1.5rem',
              background: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              color: '#64748b',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              <div>Token</div>
              <div style={{ textAlign: 'right' }}>Price</div>
              <div style={{ textAlign: 'right' }}>24h Change</div>
              <div style={{ textAlign: 'right' }}>Volume</div>
              <div style={{ textAlign: 'right' }}>Market Cap</div>
              <div></div>
            </div>
          )}

          {/* Token Rows */}
          {mockTokens.map((token) => (
            <div 
              key={token.id} 
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr auto' : '2fr 1fr 1fr 1fr 1fr 120px',
                padding: isMobile ? '1rem' : '1rem 1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                alignItems: 'center',
                gap: isMobile ? '1rem' : '0',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {/* Token Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: isMobile ? '40px' : '48px',
                  height: isMobile ? '40px' : '48px',
                  background: 'linear-gradient(135deg, #00d4ff, #2dd4bf)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? '1rem' : '1.25rem',
                  fontWeight: 700,
                  color: '#000',
                  flexShrink: 0
                }}>
                  {token.ticker[0]}
                </div>
                <div>
                  <div style={{ 
                    fontWeight: 700, 
                    color: '#fff',
                    fontSize: isMobile ? '1rem' : '1.1rem'
                  }}>
                    {token.ticker}
                  </div>
                  <div style={{ 
                    color: '#64748b', 
                    fontSize: isMobile ? '0.8rem' : '0.875rem'
                  }}>
                    {token.name}
                  </div>
                  {isMobile && (
                    <div style={{ 
                      marginTop: '0.5rem',
                      display: 'flex',
                      gap: '1rem',
                      fontSize: '0.8rem'
                    }}>
                      <span style={{ color: '#fff', fontWeight: 600 }}>${token.price}</span>
                      <span style={{ 
                        color: token.change24h.startsWith('+') ? '#22c55e' : '#ef4444',
                        fontWeight: 600
                      }}>
                        {token.change24h}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price - Desktop */}
              {!isMobile && (
                <>
                  <div style={{ textAlign: 'right', color: '#fff', fontWeight: 600 }}>
                    ${token.price}
                  </div>
                  <div style={{ 
                    textAlign: 'right', 
                    color: token.change24h.startsWith('+') ? '#22c55e' : '#ef4444',
                    fontWeight: 600
                  }}>
                    {token.change24h}
                  </div>
                  <div style={{ textAlign: 'right', color: '#94a3b8' }}>
                    ${token.volume}
                  </div>
                  <div style={{ textAlign: 'right', color: '#94a3b8' }}>
                    ${token.marketCap}
                  </div>
                </>
              )}

              {/* Trade Button */}
              <div style={{ textAlign: 'right' }}>
                <button style={{
                  padding: isMobile ? '0.5rem 1rem' : '0.5rem 1.25rem',
                  background: 'rgba(0, 212, 255, 0.1)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: '8px',
                  color: '#00d4ff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  whiteSpace: 'nowrap'
                }}>
                  Trade
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
