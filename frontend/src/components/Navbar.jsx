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
  Sparkles,
  Award
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const Navbar = ({ activePage, setActivePage, walletBalance }) => {
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const firstLetter = (user.name || user.email || 'U').charAt(0).toUpperCase();
  const vesCount = walletBalance !== undefined ? Number(walletBalance) : 0;
  const inrEstimate = (vesCount / 240).toFixed(2);

  // Compute VIP Tier from balance (matching velooprewards.in user levels)
  const getUserLevel = () => {
    if (isAdmin) return { text: 'ADMIN', color: '#ff6ea9', bg: 'rgba(255, 110, 169, 0.15)', border: 'rgba(255, 110, 169, 0.35)' };
    if (vesCount >= 50000) return { text: 'LVL 5 DIAMOND', color: '#6fd3ff', bg: 'rgba(80, 200, 255, 0.15)', border: 'rgba(60, 180, 240, 0.35)' };
    if (vesCount >= 20000) return { text: 'LVL 3 GOLD', color: '#ffc850', bg: 'rgba(255, 200, 80, 0.15)', border: 'rgba(255, 180, 40, 0.35)' };
    if (vesCount >= 5000) return { text: 'LVL 2 SILVER', color: '#e6b84a', bg: 'rgba(255, 200, 80, 0.15)', border: 'rgba(255, 180, 40, 0.35)' };
    return { text: 'LVL 1 BRONZE', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.3)' };
  };

  const userLevel = getUserLevel();

  const handleNavClick = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo - Official VELoop Typography from velooprewards.in */}
        <div
          className="nav-brand"
          onClick={() => handleNavClick('wallet')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleNavClick('wallet')}
          title="VELoop Rewards — Official Digital Wallet"
        >
          <div className="nav-brand-icon">
            <Coins size={19} color="#ffc107" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.45rem', fontWeight: 900, fontFamily: 'Poppins, sans-serif', letterSpacing: '0.04em' }}>
              <span style={{ color: '#ffc107' }}>VE</span>
              <span style={{ color: 'var(--text-primary)' }}>Loop</span>
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: 'rgba(255, 193, 7, 0.14)',
                color: 'var(--accent-ve)',
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                border: '1px solid rgba(255, 193, 7, 0.35)'
              }}
            >
              Rewards
            </span>
          </div>
        </div>

        {/* Center Country Region Badge from velooprewards.in */}
        <div className="country-region-badge" title="Region: India (INR - ₹)">
          <span style={{ fontSize: '1rem' }}>🇮🇳</span>
          <span style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-primary)' }}>India (INR)</span>
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
            <span>Redeem Payout</span>
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

          {/* Available Coins Chip - velooprewards.in signature */}
          {walletBalance !== undefined && (
            <div
              className="navbar-balance-chip"
              title={`Exchange Rate: 240 VEs = ₹1.00 (~₹${inrEstimate} INR)`}
              onClick={() => handleNavClick('payout')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleNavClick('payout')}
            >
              <span style={{ color: '#ffc107', fontSize: '0.9rem' }}>◆</span>
              <span className="tabular-nums font-mono" style={{ fontWeight: 800, color: '#ffc107' }}>
                {vesCount.toLocaleString()} VEs
              </span>
              <span className="balance-inr-tag">≈ ₹{inrEstimate}</span>
            </div>
          )}

          {/* Theme Selector */}
          <ThemeToggle />

          {/* User Profile Pill with Level Badge */}
          <div className="user-badge">
            <div className="user-avatar">{firstLetter}</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.15 }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {user.name ? user.name.split(' ')[0] : 'User'}
              </span>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  color: userLevel.color
                }}
              >
                {userLevel.text}
              </span>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Sign Out Account"
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
              <span style={{ color: '#ffc107' }}>◆</span>
              <span className="tabular-nums font-mono" style={{ fontWeight: 800, fontSize: '0.78rem', color: '#ffc107' }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                      {user.name || 'Rewards User'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        background: userLevel.bg,
                        color: userLevel.color,
                        border: `1px solid ${userLevel.border}`
                      }}
                    >
                      {userLevel.text}
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
                      Available Coins
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.15rem' }}>
                      <span className="tabular-nums font-mono" style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffc107' }}>
                        {vesCount.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-credit)' }}>
                        VEs (≈ ₹{inrEstimate} INR)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', fontWeight: 700 }}
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
                  <span className="mobile-nav-sub">Multi-currency balances & immutable ledger</span>
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
                  <span className="mobile-nav-sub">Instant bank UPI, PayPal & digital vouchers</span>
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
