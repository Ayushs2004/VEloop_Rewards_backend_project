import React from 'react';
import { Coins, Flame, Gem, Disc, Award, ArrowUpRight, TrendingUp, TrendingDown, ShieldCheck, Zap } from 'lucide-react';

export const CurrencyCards = ({ wallet, metrics, onRedeemClick }) => {
  if (!wallet) return null;

  const vesAmount = Number(wallet.ves || 0);
  const estimatedInr = (vesAmount / 240).toFixed(2);

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      {/* 5-Currency Ecosystem Grid */}
      <div className="currency-grid">
        {/* Primary VEs Hero Card - velooprewards.in Signature */}
        <div
          className="glass-card currency-hero"
          style={{
            background: 'linear-gradient(135deg, rgba(35, 37, 71, 0.95) 0%, rgba(22, 24, 43, 0.98) 100%)',
            borderColor: 'rgba(255, 193, 7, 0.3)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            padding: '1.75rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle decorative glow orb */}
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 193, 7, 0.22), transparent 70%)',
              pointerEvents: 'none'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffc107', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <Coins size={16} />
                <span>Available Coins</span>
                <span
                  style={{
                    background: 'rgba(255, 193, 7, 0.16)',
                    color: '#ffc107',
                    padding: '0.12rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    border: '1px solid rgba(255, 193, 7, 0.35)'
                  }}
                >
                  CONVERTIBLE
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.6rem' }}>
                <span
                  className="tabular-nums font-mono"
                  style={{
                    fontSize: '2.8rem',
                    fontWeight: 900,
                    letterSpacing: '-0.03em',
                    color: '#ffc107',
                    lineHeight: 1.1
                  }}
                >
                  {vesAmount.toLocaleString()}
                </span>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Poppins, sans-serif' }}>VEs</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.92rem',
                    color: '#00ffc3',
                    fontWeight: 800,
                    background: 'rgba(0, 255, 195, 0.12)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 255, 195, 0.3)'
                  }}
                >
                  ≈ ₹{estimatedInr} INR
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Standard Exchange: <strong>240 VEs = ₹1.00</strong>
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={onRedeemClick}
                style={{
                  padding: '0.8rem 1.6rem',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  background: 'linear-gradient(145deg, #3d5afe, #5c7cff)',
                  boxShadow: '0 8px 24px rgba(61, 90, 254, 0.45)'
                }}
              >
                <span>Redeem Payout</span>
                <ArrowUpRight size={17} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={14} color="#00ffc3" />
                <span>Instant verified settlement</span>
              </div>
            </div>
          </div>

          {/* Connected VIP Level XP Progress - velooprewards.in Signature */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.15rem', borderTop: '1px solid var(--border-subtle)', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                User Level: <strong style={{ color: '#ffc107' }}>LVL 2 SILVER</strong>
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                {vesAmount.toLocaleString()} / 20,000 VEs to <strong>LVL 3 GOLD (1.5x Multiplier)</strong>
              </span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, Math.round((vesAmount / 20000) * 100))}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #22c55e, #14b8a6 45%, #3b82f6)',
                  borderRadius: '9999px',
                  boxShadow: '0 0 12px rgba(34, 197, 94, 0.4)',
                  transition: 'width 0.5s ease-out'
                }}
              />
            </div>
          </div>
        </div>

        {/* SVEs Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-sve-text)', fontSize: '0.8rem', fontWeight: 700 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={16} color="currentColor" />
            </div>
            <span>Special VEs (SVEs)</span>
          </div>
          <div className="tabular-nums font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.85rem', color: 'var(--text-primary)' }}>
            {Number(wallet.sves || 0).toLocaleString()}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.25rem' }}>
            Promotional & campaign rewards
          </div>
        </div>

        {/* Gems Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gem-text)', fontSize: '0.8rem', fontWeight: 700 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Gem size={16} color="currentColor" />
            </div>
            <span>Gems</span>
          </div>
          <div className="tabular-nums font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.85rem', color: 'var(--text-primary)' }}>
            {Number(wallet.gems || 0).toLocaleString()}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.25rem' }}>
            Lucky wheel boosts & multipliers
          </div>
        </div>

        {/* Tokens Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-token-text)', fontSize: '0.8rem', fontWeight: 700 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0, 255, 195, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={16} color="currentColor" />
            </div>
            <span>Tokens</span>
          </div>
          <div className="tabular-nums font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.85rem', color: 'var(--text-primary)' }}>
            {Number(wallet.tokens || 0).toLocaleString()}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.25rem' }}>
            Mission & quest completions
          </div>
        </div>

        {/* Spins Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-spin-text)', fontSize: '0.8rem', fontWeight: 700 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255, 193, 7, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Disc size={16} color="currentColor" />
            </div>
            <span>Lucky Spins</span>
          </div>
          <div className="tabular-nums font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.85rem', color: 'var(--text-primary)' }}>
            {Number(wallet.spins || 0).toLocaleString()}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.25rem' }}>
            Active wheel rotations
          </div>
        </div>
      </div>

      {/* Lifetime Metrics Aggregate Strip */}
      {metrics && (
        <div
          className="glass-card"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            padding: '1.25rem 1.75rem',
            background: 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(0, 255, 195, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="var(--color-credit)" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                Lifetime Earned
              </div>
              <div className="tabular-nums font-mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-credit)', marginTop: '0.15rem' }}>
                +{Number(metrics.totalCreditedVEs || 0).toLocaleString()} VEs
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={18} color="var(--color-debit)" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                Lifetime Redeemed
              </div>
              <div className="tabular-nums font-mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-debit)', marginTop: '0.15rem' }}>
                -{Number(metrics.totalDebitedVEs || 0).toLocaleString()} VEs
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255, 193, 7, 0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coins size={18} color="#ffc107" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                Net Ledger Balance
              </div>
              <div className="tabular-nums font-mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffc107', marginTop: '0.15rem' }}>
                {Number(metrics.netVEsBalance || wallet.ves || 0).toLocaleString()} VEs
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
