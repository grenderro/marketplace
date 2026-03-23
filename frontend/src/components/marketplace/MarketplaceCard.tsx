import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface MarketplaceCardProps {
  id: string;
  name: string;
  image: string;
  price: string;
  currency?: string;
  creator: string;
  creatorAvatar?: string;
  likes?: number;
  isLiked?: boolean;
  collection?: string;
  isAuction?: boolean;
  endsAt?: Date;
  onLike?: (id: string) => void;
  onBuy?: (listing: { id: string; name: string; price: string; currency: string }) => void;
}

export default function MarketplaceCard({
  id,
  name,
  image,
  price,
  currency = 'EGLD',
  creator,
  creatorAvatar,
  likes = 0,
  isLiked = false,
  collection,
  isAuction = false,
  endsAt,
  onLike,
  onBuy
}: MarketplaceCardProps) {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const formatTimeLeft = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div
      onClick={() => navigate(`/nft/${id}`)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      style={{
        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        transform: isPressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        position: 'relative',
        boxShadow: isPressed 
          ? '0 4px 20px rgba(0,0,0,0.3)' 
          : '0 8px 32px rgba(0,0,0,0.2)'
      }}
    >
      {/* Image Container */}
      <div style={{
        position: 'relative',
        aspectRatio: '1',
        overflow: 'hidden',
        background: 'rgba(0,0,0,0.2)'
      }}>
        {!imageLoaded && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }} />
        )}
        
        <img
          src={image}
          alt={name}
          onLoad={() => setImageLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s, transform 0.3s',
            transform: isPressed ? 'scale(1.05)' : 'scale(1)'
          }}
        />

        {/* Badges */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          {isAuction && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.9)',
              color: '#0f172a',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backdropFilter: 'blur(10px)'
            }}>
              <span>🔨</span>
              <span>{endsAt ? formatTimeLeft(endsAt) : 'Live'}</span>
            </div>
          )}
          {collection && (
            <div style={{
              background: 'rgba(0, 212, 255, 0.9)',
              color: '#0f172a',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backdropFilter: 'blur(10px)'
            }}>
              {collection}
            </div>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike?.(id);
          }}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)',
            border: 'none',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            zIndex: 2
          }}
        >
          {isLiked ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        {/* Creator Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#0f172a',
            overflow: 'hidden'
          }}>
            {creatorAvatar ? (
              <img src={creatorAvatar} alt={creator} style={{ width: '100%', height: '100%' }} />
            ) : (
              creator.charAt(0).toUpperCase()
            )}
          </div>
          <span style={{
            fontSize: '0.875rem',
            color: '#94a3b8',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            @{creator}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          color: '#fff',
          margin: '0 0 12px 0',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          lineHeight: 1.3
        }}>
          {name}
        </h3>

        {/* Price & Action Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div>
            <div style={{
              fontSize: '0.75rem',
              color: '#64748b',
              fontWeight: 600,
              marginBottom: '2px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {isAuction ? 'Current Bid' : 'Price'}
            </div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#00d4ff',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {price}
              <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{currency}</span>
            </div>
          </div>

          {/* Buy Button - FIXED HERE */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBuy?.({ 
                id, 
                name, 
                price, 
                currency 
              });
            }}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#0f172a',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
              whiteSpace: 'nowrap',
              minWidth: '80px'
            }}
          >
            {isAuction ? 'Bid' : 'Buy'}
          </button>
        </div>

        {/* Likes count */}
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.875rem',
          color: '#64748b'
        }}>
          <span>❤️</span>
          <span>{likes.toLocaleString()} likes</span>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
