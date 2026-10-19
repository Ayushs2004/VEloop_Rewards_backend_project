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
  ChevronRight,
  Sparkles
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
          title="VELoop Rewards — Home"
        >
          <div className="nav-brand-icon">
            <Coins size={18} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>VELoop</span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-ve-text)',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}
            >
              Rewards
            </span>
          </div>
        </div>

        {/* Desktop Navigation Items */}
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
              <span>Admin Console</span>
            </button>
          )}

          {/* Live Balance Chip with Tooltip */}
          {walletBalance !== undefined && (
            <div
              className="navbar-balance-chip"
              title={`240 VEs = ₹1.00 (~₹${inrEstimate} INR)`}
              onClick={() => handleNavClick('payout')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleNavClick('payout')}
            >
              <span style={{ color: 'var(--accent-ve-text)' }}>◆</span>
              <span className="tabular-nums font-mono" style={{ fontWeight: 700 }}>
                {vesCount.toLocaleString()} VEs
              </span>
              <span className="balance-inr-tag">≈ ₹{inrEstimate}</span>
            </div>
          )}

          {/* Theme Selector */}
          <ThemeToggle />

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
              className="navbar-signout-btn"
            >
              <LogOut size={14} />
            </button>
          </div>
        </nav>

        {/* Mobile Header Controls */}
        <div className="mobile-header-controls">
          {walletBalance !== undefined && (
            <div
              className="navbar-balance-chip mobile-compact"
              onClick={() => handleNavClick('payout')}
            >
              <span style={{ color: 'var(--accent-ve-text)' }}>◆</span>
              <span className="tabular-nums font-mono" style={{ fontWeight: 700, fontSize: '0.78rem' }}>
                {vesCount.toLocaleString()}
              </span>
            </div>
          )}

          <ThemeToggle />

          <button
            type="button"
            className="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay fade-in">
          <div className="mobile-drawer-card">
            {/* User Profile Summary in Drawer */}
            <div className="mobile-user-card">
              <div className="mobile-user-info">
                <div className="user-avatar large">{firstLetter}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {user.name || 'Rewards User'}
                    </span>
                    <span className={`role-pill ${user.role === 'ADMIN' ? 'admin' : ''}`}>
                      {user.role}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {user.email}
                  </span>
                </div>
              </div>

              {walletBalance !== undefined && (
                <div className="mobile-wallet-preview">
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Available Balance
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.15rem' }}>
                      <span className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-ve)' }}>
                        {vesCount.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        VEs (≈ ₹{inrEstimate})
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

            {/* Navigation Buttons */}
            <div className="mobile-drawer-nav">
              <button
                type="button"
                className={`mobile-nav-item ${activePage === 'wallet' ? 'active' : ''}`}
                onClick={() => handleNavClick('wallet')}
              >
                <div className="mobile-nav-item-icon">
                  <Wallet size={18} />
                </div>
                <div className="mobile-nav-item-text">
                  <span className="mobile-nav-title">Rewards Wallet</span>
                  <span className="mobile-nav-sub">Balances, metrics, and transaction ledger</span>
                </div>
                <ChevronRight size={16} className="mobile-nav-arrow" />
              </button>

              <button
                type="button"
                className={`mobile-nav-item ${activePage === 'payout' ? 'active' : ''}`}
                onClick={() => handleNavClick('payout')}
              >
                <div className="mobile-nav-item-icon redeem">
                  <ArrowRightLeft size={18} />
                </div>
                <div className="mobile-nav-item-text">
                  <span className="mobile-nav-title">Redeem Payouts</span>
                  <span className="mobile-nav-sub">Convert VEs to cash UPI or gift cards</span>
                </div>
                <ChevronRight size={16} className="mobile-nav-arrow" />
              </button>

              {isAdmin && (
                <button
                  type="button"
                  className={`mobile-nav-item admin ${activePage === 'admin' ? 'active' : ''}`}
                  onClick={() => handleNavClick('admin')}
                >
                  <div className="mobile-nav-item-icon admin">
                    <Shield size={18} />
                  </div>
                  <div className="mobile-nav-item-text">
                    <span className="mobile-nav-title">Admin Console</span>
                    <span className="mobile-nav-sub">User accounts, approvals & audit logs</span>
                  </div>
                  <ChevronRight size={16} className="mobile-nav-arrow" />
                </button>
              )}
            </div>

            {/* Drawer Logout Action */}
            <div className="mobile-drawer-footer">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="mobile-logout-button"
              >
                <LogOut size={16} />
                <span>Sign Out Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
