import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSdk } from '../stubs/SdkStubs';
import { WalletConnector } from '../WalletConnector';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  description: string;
}

const navItems: NavItem[] = [
  { label: 'NFTs', path: '/nfts', icon: '🎨', description: 'Buy & sell unique digital collectibles' },
  { label: 'ESDT Tokens', path: '/esdt', icon: '🪙', description: 'Trade MultiversX standard tokens' },
  { label: 'Auctions', path: '/auctions', icon: '🔨', description: 'Bid on exclusive items in real-time' },
  { label: 'Create NFT', path: '/create-nft', icon: '➕', description: 'Mint new NFT collections' },
  { label: 'Create ESDT', path: '/create-esdt', icon: '⚡', description: 'Launch new tokens' }
];

const LOGO_URL = 'https://sapphire-acute-anaconda-630.mypinata.cloud/ipfs/bafybeiegq45s2v4qixkghaz74ttknojllmw75wmb2wxl6bqyvyccfa2eve';

export default function MarketplaceNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useSdk();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    const handleScroll = () => setScrolled(window.scrollY > 10);

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [menuOpen]);

  const handleNav = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  const activeItem = navItems.find(item => location.pathname === item.path);

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled || menuOpen ? 'rgba(15, 23, 42, 0.98)' : 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: isMobile ? '0.75rem 1rem' : '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative'
        }}>
          {/* Logo */}
          <div onClick={() => navigate('/')} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            height: isMobile ? '36px' : '44px',
            zIndex: 1002
          }}>
            <img
              src={LOGO_URL}
              alt="Trad3X"
              style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          {/* Desktop Nav */}
          {!isMobile && (
            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: location.pathname === item.path ? 'rgba(0, 212, 255, 0.15)' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: location.pathname === item.path ? '#00d4ff' : '#94a3b8',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}

              {/* REPLACED: WalletConnector for desktop */}
              <div style={{ marginLeft: '0.75rem' }}>
                <WalletConnector variant="nav" />
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: menuOpen ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '12px',
                color: menuOpen ? '#00d4ff' : '#fff',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: '0.5rem',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                zIndex: 1002
              }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          )}
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobile && menuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
            borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            zIndex: 1001,
            animation: 'slideDown 0.3s ease-out',
            maxHeight: 'calc(100vh - 70px)',
            overflowY: 'auto'
          }}>
            <div style={{ padding: '1rem' }}>
              {/* Current Page Indicator */}
              {activeItem && (
                <div style={{
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
                  background: 'rgba(0, 212, 255, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{activeItem.icon}</span>
                  <div>
                    <div style={{ color: '#00d4ff', fontWeight: 700, fontSize: '1rem' }}>
                      Currently on
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                      {activeItem.label}
                    </div>
                  </div>
                </div>
              )}

              {/* Nav Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    style={{
                      padding: '1rem 0.75rem',
                      background: location.pathname === item.path
                        ? 'rgba(0, 212, 255, 0.2)'
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${location.pathname === item.path
                        ? 'rgba(0, 212, 255, 0.5)'
                        : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ fontSize: '1.75rem' }}>{item.icon}</span>
                    <span style={{
                      color: location.pathname === item.path ? '#00d4ff' : '#fff',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textAlign: 'center'
                    }}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Quick Actions */}
              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
                paddingTop: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <button
                  onClick={() => {
                    if (!isAuthenticated) alert('Please connect your wallet');
                    else navigate('/create');
                    setMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#0f172a',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>➕</span>
                  Create Listing
                </button>

                {/* REPLACED: WalletConnector for mobile menu */}
                <div style={{ marginTop: '0.5rem' }}>
                  <WalletConnector variant="button" />
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop */}
      {isMobile && menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
            animation: 'fadeIn 0.2s ease-out'
          }}
        />
      )}

      {/* Spacer */}
      <div style={{ height: isMobile ? '60px' : '76px' }} />

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
