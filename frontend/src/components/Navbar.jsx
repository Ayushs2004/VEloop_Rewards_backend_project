import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, Shield, LogOut, ArrowRightLeft, Sparkles, Coins } from 'lucide-react';

export const Navbar = ({ activePage, setActivePage, walletBalance }) => {
  const { user, logout, isAdmin } = useAuth();

  if (!user) return null;

  const firstLetter = (user.name || user.email || 'U').charAt(0).toUpperCase();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div
          className="nav-brand"
          onClick={() => setActivePage('wallet')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setActivePage('wallet')}
          title="VELoop Rewards — Home"
        >
          <div className="nav-brand-icon">
            <Coins size={18} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span>VELoop</span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#a5b4fc',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}
            >
              Rewards
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="nav-links">
          <button
            type="button"
            className={`nav-link ${activePage === 'wallet' ? 'active' : ''}`}
            onClick={() => setActivePage('wallet')}
          >
            <Wallet size={15} />
            <span>Wallet</span>
          </button>

          <button
            type="button"
            className={`nav-link ${activePage === 'payout' ? 'active' : ''}`}
            onClick={() => setActivePage('payout')}
          >
            <ArrowRightLeft size={15} />
            <span>Redeem</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              className={`nav-link admin-link ${activePage === 'admin' ? 'active' : ''}`}
              onClick={() => setActivePage('admin')}
            >
              <Shield size={15} />
              <span>Admin Console</span>
            </button>
          )}

          {/* Live Balance Chip */}
          {walletBalance !== undefined && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                background: 'rgba(139, 92, 246, 0.12)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                color: '#c4b5fd',
                fontSize: '0.82rem',
                fontWeight: 600
              }}
              title={`240 VEs = ₹1.00 (~₹${(Number(walletBalance) / 240).toFixed(2)})`}
            >
              <span style={{ color: '#a78bfa' }}>◆</span>
              <span className="tabular-nums">{Number(walletBalance).toLocaleString()} VEs</span>
            </div>
          )}

          {/* User Profile Pill */}
          <div className="user-badge">
            <div className="user-avatar">{firstLetter}</div>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {user.name ? user.name.split(' ')[0] : 'User'}
            </span>
            <span className={`role-pill ${user.role === 'ADMIN' ? 'admin' : ''}`}>
              {user.role}
            </span>
            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              style={{
                display: 'flex',
                alignItems: 'center',
                color: 'var(--text-muted)',
                padding: '0.2rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <LogOut size={14} />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};
