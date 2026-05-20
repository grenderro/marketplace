import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSdk } from '../../../components/stubs/SdkStubs';
import MarketplaceNav from '../../../components/marketplace/MarketplaceNav';
import { fetchAccountNFTs, NFT } from '../../../services/multiversxApi';

export default function Holdings() {
  const sdk = useSdk();
  const isAuthenticated = sdk.isAuthenticated;
  const address = sdk.address;
  const [isMobile, setIsMobile] = useState(false);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isAuthenticated && address) {
      fetchHoldings();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, address]);

  const fetchHoldings = async () => {
    setLoading(true);
    try {
      const data = await fetchAccountNFTs(address!);
      setNfts(data);
    } catch (error) {
      console.error('Failed to fetch holdings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (nft: NFT): string | null => {
    if (nft.assets?.url) return nft.assets.url;
    if (nft.assets?.thumbnailUrl) return nft.assets.thumbnailUrl;
    if (nft.url) return nft.url;
    if (nft.thumbnailUrl) return nft.thumbnailUrl;
    return null;
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
          My <span style={{ color: '#00d4ff' }}>Holdings</span>
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
          All NFTs and SFTs currently in your wallet.
        </motion.p>
      </div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: isMobile ? '1rem 0.5rem' : '2rem'
      }}>
        {!isAuthenticated ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Wallet Not Connected</h3>
            <p>Please connect your wallet to view your holdings.</p>
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
            Loading your holdings...
          </div>
        ) : nfts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Holdings Found</h3>
            <p>Your wallet doesn't hold any NFTs or SFTs.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: isMobile ? '0.75rem' : '1.5rem'
          }}>
            {nfts.map((nft) => {
              const imageUrl = getImageUrl(nft);
              return (
                <div key={nft.identifier} style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}>
                  <div style={{
                    aspectRatio: '1/1',
                    background: imageUrl ? undefined : 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(168,85,247,0.2))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? '2.5rem' : '3.5rem',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={nft.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      '🎨'
                    )}
                    <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      padding: '0.25rem 0.75rem',
                      background: 'rgba(0,0,0,0.6)',
                      borderRadius: '20px',
                      fontSize: '0.7rem',
                      color: '#00d4ff',
                      border: '1px solid rgba(0,212,255,0.3)'
                    }}>
                      {nft.balance && parseInt(nft.balance) > 1 ? `x${nft.balance}` : '1'}
                    </div>
                  </div>
                  <div style={{ padding: isMobile ? '0.75rem' : '1rem' }}>
                    <p style={{
                      margin: '0 0 0.25rem',
                      color: '#64748b',
                      fontSize: isMobile ? '0.7rem' : '0.8rem'
                    }}>
                      {nft.collection}
                    </p>
                    <h4 style={{
                      margin: '0 0 0.5rem',
                      color: '#fff',
                      fontSize: isMobile ? '0.9rem' : '1rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {nft.name}
                    </h4>
                    {nft.metadata?.description && (
                      <p style={{
                        margin: '0 0 0.5rem',
                        color: '#94a3b8',
                        fontSize: '0.8rem',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {nft.metadata.description}
                      </p>
                    )}
                  </div>
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
