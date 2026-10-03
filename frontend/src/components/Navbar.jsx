import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, Shield, LogOut, ArrowRightLeft, Sparkles } from 'lucide-react';

export const Navbar = ({ activePage, setActivePage, walletBalance }) => {
  const { user, logout, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="nav-brand" onClick={() => setActivePage('wallet')} style={{ cursor: 'pointer' }}>
          <div className="nav-brand-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <span>VELoop</span>
            <span style={{ color: '#8b5cf6', marginLeft: '4px' }}>Rewards</span>
          </div>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-link ${activePage === 'wallet' ? 'active' : ''}`}
            onClick={() => setActivePage('wallet')}
          >
            <Wallet size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            Wallet
          </button>

          <button
            className={`nav-link ${activePage === 'payout' ? 'active' : ''}`}
            onClick={() => setActivePage('payout')}
          >
            <ArrowRightLeft size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            Redeem / Payout
          </button>

          {isAdmin && (
            <button
              className={`nav-link ${activePage === 'admin' ? 'active' : ''}`}
              onClick={() => setActivePage('admin')}
              style={{ color: '#ec4899' }}
            >
              <Shield size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              Admin Portal
            </button>
          )}

          {walletBalance !== undefined && (
            <div
              style={{
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                padding: '0.35rem 0.85rem',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#c4b5fd'
              }}
            >
              <span>⭐</span>
              <span>{Number(walletBalance).toLocaleString()} VEs</span>
            </div>
          )}

          <div className="user-badge">
            <span style={{ fontWeight: 600 }}>{user.name.split(' ')[0]}</span>
            <span className={`role-pill ${user.role === 'ADMIN' ? 'admin' : ''}`}>
              {user.role}
            </span>
            <button
              onClick={logout}
              title="Sign Out"
              style={{
                background: 'transparent',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                marginLeft: '4px'
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};
