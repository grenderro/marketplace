// WalletConnector.tsx — Uses shared wallet context for proper sdk-dapp integration
import React, { useState } from 'react';
import { useSdk } from './stubs/SdkStubs';

interface WalletConnectorProps {
  variant?: 'nav' | 'button';
}

export const WalletConnector: React.FC<WalletConnectorProps> = ({ variant = 'nav' }) => {
  const { address, isAuthenticated, formattedBalance, login, logout } = useSdk();
  const [showModal, setShowModal] = useState(false);

  const handleLogin = async (provider: string) => {
    setShowModal(false);
    try {
      await login(provider);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (isAuthenticated && address) {
    return (
      <div className={`wallet-connector-connected ${variant}`} style={connectedContainerStyle}>
        <div style={connectedBadgeStyle}>
          <span style={dotStyle} />
          Connected
        </div>
        <div style={addressBalanceStyle}>
          <span style={addressStyle} title={address}>
            {address.slice(0, 8)}...{address.slice(-4)}
          </span>
          <span style={balanceStyle}>
            {formattedBalance} EGLD
          </span>
        </div>
        <button onClick={handleLogout} style={disconnectBtnStyle}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`connect-wallet-btn ${variant}`}
      >
        {variant === 'button' ? 'Connect Wallet' : 'Connect'}
      </button>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#1e293b',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '400px',
              width: '90%',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: '#fff', marginBottom: '1.5rem', textAlign: 'center' }}>
              Connect Wallet
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => handleLogin('extension')} style={walletButtonStyle}>
                🧩 MultiversX Extension
              </button>
              <button onClick={() => handleLogin('web')} style={walletButtonStyle}>
                🌐 Web Wallet
              </button>
              <button onClick={() => handleLogin('xportal')} style={walletButtonStyle}>
                📱 xPortal Mobile
              </button>
            </div>
            <button
              onClick={() => setShowModal(false)}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.75rem',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const connectedContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.5rem 1rem',
  background: 'rgba(0, 212, 255, 0.1)',
  borderRadius: '12px',
  border: '1px solid rgba(0, 212, 255, 0.2)',
};

const connectedBadgeStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#00d4ff',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const dotStyle: React.CSSProperties = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: '#00d4ff',
  display: 'inline-block',
};

const addressBalanceStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '0.15rem',
};

const addressStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#fff',
  fontFamily: 'monospace',
};

const balanceStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: '#94a3b8',
};

const disconnectBtnStyle: React.CSSProperties = {
  padding: '0.4rem 0.75rem',
  background: 'transparent',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  borderRadius: '8px',
  color: '#ef4444',
  fontSize: '0.75rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const walletButtonStyle: React.CSSProperties = {
  padding: '1rem',
  background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
  border: 'none',
  borderRadius: '12px',
  color: '#0f172a',
  fontWeight: 700,
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

export default WalletConnector;
