// MobileBottomNav.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const bottomNavItems = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/explore', icon: '🔍', label: 'Explore' },
  { path: '/create-nft', icon: '➕', label: 'Create', highlight: true },
  { path: '/auctions', icon: '🔨', label: 'Auctions' },
  { path: '/profile', icon: '👤', label: 'Profile' },
];

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = window.innerWidth < 768;

  if (!isMobile) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(15, 23, 42, 0.98)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      padding: '0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom))',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 1000
    }}>
      {bottomNavItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.5rem',
            background: 'transparent',
            border: 'none',
            color: location.pathname === item.path ? '#00d4ff' : '#64748b',
            fontSize: '0.7rem',
            fontWeight: 600,
            position: 'relative'
          }}
        >
          {item.highlight ? (
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              marginTop: '-20px',
              border: '4px solid #0f172a',
              boxShadow: '0 4px 20px rgba(0, 212, 255, 0.4)'
            }}>
              {item.icon}
            </div>
          ) : (
            <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
          )}
          {!item.highlight && item.label}
        </button>
      ))}
    </div>
  );
}
