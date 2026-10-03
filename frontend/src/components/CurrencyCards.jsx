import React from 'react';
import { Coins, Flame, Gem, Disc, Award, ArrowUpRight } from 'lucide-react';

export const CurrencyCards = ({ wallet, metrics, onRedeemClick }) => {
  if (!wallet) return null;

  return (
    <div>
      {/* Primary VEs Hero Card + 4 Ancillary Ecosystem Currencies */}
      <div className="currency-grid">
        {/* VEs - Primary Redemption Currency */}
        <div
          className="glass-card"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(30, 27, 75, 0.6))',
            borderColor: 'rgba(139, 92, 246, 0.4)',
            gridColumn: 'span 2'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c4b5fd', fontSize: '0.9rem', fontWeight: 600 }}>
                <Coins size={18} />
                <span>Platform Primary Currency</span>
              </div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '0.5rem', color: '#ffffff' }}>
                {Number(wallet.ves || 0).toLocaleString()} <span style={{ fontSize: '1.25rem', color: '#a78bfa' }}>VEs</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Available for instant UPI, PayPal, and Gift Card cashout
              </p>
            </div>
            <button className="btn-primary" onClick={onRedeemClick} style={{ marginTop: '0.5rem' }}>
              Redeem VEs <ArrowUpRight size={18} />
            </button>
          </div>
        </div>

        {/* SVEs */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#93c5fd', fontSize: '0.85rem', fontWeight: 600 }}>
            <Flame size={18} />
            <span>Special VEs (SVEs)</span>
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem' }}>
            {Number(wallet.sves || 0).toLocaleString()}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            Seasonal & promotional rewards
          </p>
        </div>

        {/* Gems */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f472b6', fontSize: '0.85rem', fontWeight: 600 }}>
            <Gem size={18} />
            <span>Gems</span>
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem' }}>
            {Number(wallet.gems || 0).toLocaleString()}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            VIP tier boosters & perks
          </p>
        </div>

        {/* Tokens */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6ee7b7', fontSize: '0.85rem', fontWeight: 600 }}>
            <Award size={18} />
            <span>Tokens</span>
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem' }}>
            {Number(wallet.tokens || 0).toLocaleString()}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            Quest & milestone items
          </p>
        </div>

        {/* Spins */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fcd34d', fontSize: '0.85rem', fontWeight: 600 }}>
            <Disc size={18} />
            <span>Lucky Spins</span>
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem' }}>
            {Number(wallet.spins || 0).toLocaleString()}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            Wheel spins remaining
          </p>
        </div>
      </div>

      {/* Ledger Metrics Aggregates */}
      {metrics && (
        <div
          className="glass-card"
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
            background: 'rgba(17, 24, 39, 0.45)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Lifetime VEs Credited
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981', marginTop: '0.2rem' }}>
              +{Number(metrics.totalCreditedVEs || 0).toLocaleString()}
            </div>
          </div>

          <div style={{ width: '1px', height: '36px', background: 'var(--border-color)' }} />

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Lifetime VEs Redeemed
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.2rem' }}>
              -{Number(metrics.totalDebitedVEs || 0).toLocaleString()}
            </div>
          </div>

          <div style={{ width: '1px', height: '36px', background: 'var(--border-color)' }} />

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Current Verified Balance
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#8b5cf6', marginTop: '0.2rem' }}>
              {Number(metrics.netVEsBalance || wallet.ves || 0).toLocaleString()} VEs
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
