import React from 'react';
import { Coins, Flame, Gem, Disc, Award, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';

export const CurrencyCards = ({ wallet, metrics, onRedeemClick }) => {
  if (!wallet) return null;

  const vesAmount = Number(wallet.ves || 0);
  const estimatedInr = (vesAmount / 240).toFixed(2);

  const currencies = [
    { key: 'sves', label: 'SVEs', icon: Flame, value: wallet.sves, desc: 'Promotional rewards', color: 'var(--accent-sve)' },
    { key: 'gems', label: 'Gems', icon: Gem, value: wallet.gems, desc: 'Wheel boosts', color: 'var(--accent-gem)' },
    { key: 'tokens', label: 'Tokens', icon: Award, value: wallet.tokens, desc: 'Quest completions', color: 'var(--accent-token)' },
    { key: 'spins', label: 'Spins', icon: Disc, value: wallet.spins, desc: 'Wheel rotations', color: 'var(--accent-spin)' }
  ];

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div className="currency-grid">
        {/* Primary VEs Card */}
        <div
          className="glass-card currency-hero"
          style={{
            padding: '1.5rem',
            borderColor: 'var(--primary-border)',
            background: 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-ve)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Coins size={14} />
                <span>Available VEs</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.4rem' }}>
                <span
                  className="tabular-nums font-mono"
                  style={{
                    fontSize: '2.25rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    lineHeight: 1.1
                  }}
                >
                  {vesAmount.toLocaleString()}
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>VEs</span>
              </div>

              <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                ≈ ₹{estimatedInr} INR
                <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  (240 VEs = ₹1)
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={onRedeemClick}
              style={{ padding: '0.55rem 1.25rem', fontWeight: 600 }}
            >
              <span>Redeem</span>
              <ArrowUpRight size={15} />
            </button>
          </div>

          {/* Progress Bar */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                Progress to next level
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                {vesAmount.toLocaleString()} / 20,000 VEs
              </span>
            </div>
            <div style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, Math.round((vesAmount / 20000) * 100))}%`,
                  height: '100%',
                  background: 'var(--primary)',
                  borderRadius: '9999px',
                  transition: 'width 0.5s ease-out'
                }}
              />
            </div>
          </div>
        </div>

        {/* Secondary Currency Cards */}
        {currencies.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.key} className="glass-card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: c.color, fontSize: '0.75rem', fontWeight: 600 }}>
                <Icon size={14} />
                <span>{c.label}</span>
              </div>
              <div className="tabular-nums font-mono" style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                {Number(c.value || 0).toLocaleString()}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.15rem' }}>
                {c.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lifetime Metrics */}
      {metrics && (
        <div
          className="glass-card"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.25rem',
            padding: '1rem 1.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <TrendingUp size={16} style={{ color: 'var(--color-credit)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Earned
              </div>
              <div className="tabular-nums font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-credit)' }}>
                +{Number(metrics.totalCreditedVEs || 0).toLocaleString()} VEs
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <TrendingDown size={16} style={{ color: 'var(--color-debit)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Redeemed
              </div>
              <div className="tabular-nums font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-debit)' }}>
                -{Number(metrics.totalDebitedVEs || 0).toLocaleString()} VEs
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Coins size={16} style={{ color: 'var(--accent-ve)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Net Balance
              </div>
              <div className="tabular-nums font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {Number(metrics.netVEsBalance || wallet.ves || 0).toLocaleString()} VEs
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
