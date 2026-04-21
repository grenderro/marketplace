// WalletConnector.tsx — Uses @multiversx/sdk-dapp hooks for proper wallet integration
import React, { useState } from 'react';
import {
  useGetAccountInfo,
  useGetLoginInfo,
} from '@multiversx/sdk-dapp/hooks';
import {
  useExtensionLogin,
  useWebWalletLogin,
  useWalletConnectV2Login,
} from '@multiversx/sdk-dapp/hooks';
import { logout } from '@multiversx/sdk-dapp/utils';

interface WalletConnectorProps {
  variant?: 'nav' | 'button';
}

export const WalletConnector: React.FC<WalletConnectorProps> = ({ variant = 'nav' }) => {
  const { address } = useGetAccountInfo();
  const { isLoggedIn } = useGetLoginInfo();
  const [showModal, setShowModal] = useState(false);

  const [initExtensionLogin] = useExtensionLogin({ callbackRoute: window.location.pathname });
  const [initWebWalletLogin] = useWebWalletLogin({ callbackRoute: window.location.pathname });
  const [initWalletConnectLogin] = useWalletConnectV2Login({
    callbackRoute: window.location.pathname,
    logoutRoute: '/',
  });

  const handleLogin = async (provider: string) => {
    setShowModal(false);
    try {
      switch (provider) {
        case 'extension':
          await initExtensionLogin();
          break;
        case 'web':
          await initWebWalletLogin();
          break;
        case 'mobile':
        case 'xportal':
          await initWalletConnectLogin();
          break;
        default:
          console.warn('Unknown provider:', provider);
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleLogout = () => {
    logout(window.location.pathname);
  };

  if (isLoggedIn && address) {
    return (
      <div className={`wallet-connector-connected ${variant}`}>
        <span className="wallet-address">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button onClick={handleLogout} className="disconnect-btn">
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
