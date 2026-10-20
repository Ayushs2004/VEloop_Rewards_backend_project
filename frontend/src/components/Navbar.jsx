import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  Shield,
  LogOut,
  ArrowRightLeft,
  Coins,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const Navbar = ({ activePage, setActivePage, walletBalance }) => {
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const firstLetter = (user.name || user.email || 'U').charAt(0).toUpperCase();
  const vesCount = walletBalance !== undefined ? Number(walletBalance) : 0;
  const inrEstimate = (vesCount / 240).toFixed(2);

  const handleNavClick = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div
          className="nav-brand"
          onClick={() => handleNavClick('wallet')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleNavClick('wallet')}
        >
          <div className="nav-brand-icon">
            <Coins size={16} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>
            <span style={{ color: 'var(--accent-ve)' }}>VE</span>
            <span>Loop</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-links desktop-only-nav">
          <button
            type="button"
            className={`nav-link ${activePage === 'wallet' ? 'active' : ''}`}
            onClick={() => handleNavClick('wallet')}
          >
            <Wallet size={15} />
            <span>Wallet</span>
          </button>

          <button
            type="button"
            className={`nav-link ${activePage === 'payout' ? 'active' : ''}`}
            onClick={() => handleNavClick('payout')}
          >
            <ArrowRightLeft size={15} />
            <span>Redeem</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              className={`nav-link admin-link ${activePage === 'admin' ? 'active' : ''}`}
              onClick={() => handleNavClick('admin')}
            >
              <Shield size={15} />
              <span>Admin</span>
            </button>
          )}

          {/* Balance chip */}
          {walletBalance !== undefined && (
            <div
              className="navbar-balance-chip"
              title={`${vesCount.toLocaleString()} VEs ≈ ₹${inrEstimate}`}
              onClick={() => handleNavClick('payout')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleNavClick('payout')}
            >
              <span className="tabular-nums font-mono" style={{ fontWeight: 700 }}>
                {vesCount.toLocaleString()} VEs
              </span>
            </div>
          )}

          <ThemeToggle />

          {/* User badge */}
          <div className="user-badge">
            <div className="user-avatar">{firstLetter}</div>
            <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>
              {user.name ? user.name.split(' ')[0] : 'User'}
            </span>
            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="navbar-signout-btn"
            >
              <LogOut size={14} />
            </button>
          </div>
        </nav>

        {/* Mobile Controls */}
        <div className="mobile-header-controls">
          {walletBalance !== undefined && (
            <div
              className="navbar-balance-chip mobile-compact"
              onClick={() => handleNavClick('payout')}
            >
              <span className="tabular-nums font-mono" style={{ fontWeight: 700, fontSize: '0.78rem' }}>
                {vesCount.toLocaleString()} VEs
              </span>
            </div>
          )}

          <ThemeToggle />

          <button
            type="button"
            className="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay">
          <div className="mobile-drawer-card">
            {/* User Card */}
            <div className="mobile-user-card">
              <div className="mobile-user-info">
                <div className="user-avatar large">{firstLetter}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    {user.name || 'User'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {user.email}
                  </div>
                </div>
              </div>

              {walletBalance !== undefined && (
                <div className="mobile-wallet-preview">
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Balance
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginTop: '0.1rem' }}>
                      <span className="tabular-nums font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-ve)' }}>
                        {vesCount.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        VEs ≈ ₹{inrEstimate}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                    onClick={() => handleNavClick('payout')}
                  >
                    Redeem
                  </button>
                </div>
              )}
            </div>

            {/* Nav Items */}
            <div className="mobile-drawer-nav">
              <button
                type="button"
                className={`mobile-nav-item ${activePage === 'wallet' ? 'active' : ''}`}
                onClick={() => handleNavClick('wallet')}
              >
                <div className="mobile-nav-item-icon">
                  <Wallet size={16} />
                </div>
                <div className="mobile-nav-item-text">
                  <span className="mobile-nav-title">Wallet</span>
                  <span className="mobile-nav-sub">Balances & transactions</span>
                </div>
                <ChevronRight size={14} className="mobile-nav-arrow" />
              </button>

              <button
                type="button"
                className={`mobile-nav-item ${activePage === 'payout' ? 'active' : ''}`}
                onClick={() => handleNavClick('payout')}
              >
                <div className="mobile-nav-item-icon redeem">
                  <ArrowRightLeft size={16} />
                </div>
                <div className="mobile-nav-item-text">
                  <span className="mobile-nav-title">Redeem</span>
                  <span className="mobile-nav-sub">UPI, PayPal & gift cards</span>
                </div>
                <ChevronRight size={14} className="mobile-nav-arrow" />
              </button>

              {isAdmin && (
                <button
                  type="button"
                  className={`mobile-nav-item admin ${activePage === 'admin' ? 'active' : ''}`}
                  onClick={() => handleNavClick('admin')}
                >
                  <div className="mobile-nav-item-icon admin">
                    <Shield size={16} />
                  </div>
                  <div className="mobile-nav-item-text">
                    <span className="mobile-nav-title">Admin</span>
                    <span className="mobile-nav-sub">Users, approvals & logs</span>
                  </div>
                  <ChevronRight size={14} className="mobile-nav-arrow" />
                </button>
              )}
            </div>

            {/* Logout */}
            <div className="mobile-drawer-footer">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="mobile-logout-button"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
