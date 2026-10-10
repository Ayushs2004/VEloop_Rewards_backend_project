import React from 'react';
import { Coins, Flame, Gem, Disc, Award, ArrowUpRight, TrendingUp, TrendingDown, ShieldCheck } from 'lucide-react';

export const CurrencyCards = ({ wallet, metrics, onRedeemClick }) => {
  if (!wallet) return null;

  const vesAmount = Number(wallet.ves || 0);
  const estimatedInr = (vesAmount / 240).toFixed(2);

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      {/* 5-Currency Ecosystem Grid */}
      <div className="currency-grid">
        {/* Primary VEs Hero Card */}
        <div
          className="glass-card currency-hero"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(15, 21, 35, 0.85) 100%)',
            borderColor: 'rgba(139, 92, 246, 0.35)',
            boxShadow: '0 16px 36px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
            padding: '1.75rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-ve)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Coins size={16} />
                <span>Primary Balance Currency</span>
                <span
                  style={{
                    background: 'rgba(139, 92, 246, 0.18)',
                    color: 'var(--accent-ve-text)',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700
                  }}
                >
                  CONVERTIBLE
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.5rem' }}>
                <span
                  className="tabular-nums"
                  style={{
                    fontSize: '2.6rem',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: 'var(--text-primary)',
                    lineHeight: 1.1
                  }}
                >
                  {vesAmount.toLocaleString()}
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-ve-text)' }}>VEs</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.65rem' }}>
                <span
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--color-credit)',
                    fontWeight: 600,
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(16, 185, 129, 0.25)'
                  }}
                >
                  ≈ ₹{estimatedInr} INR
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Conversion standard: 240 VEs = ₹1.00
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={onRedeemClick}
                style={{ padding: '0.75rem 1.4rem' }}
              >
                <span>Redeem Rewards</span>
                <ArrowUpRight size={16} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={14} color="#10b981" />
                <span>Instant atomic debit</span>
              </div>
            </div>
          </div>
        </div>

        {/* SVEs Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-sve-text)', fontSize: '0.8rem', fontWeight: 600 }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={15} color="currentColor" />
            </div>
            <span>Special VEs (SVEs)</span>
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.65rem', fontWeight: 700, marginTop: '0.75rem', color: 'var(--text-primary)' }}>
            {Number(wallet.sves || 0).toLocaleString()}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.25rem' }}>
            Campaign & promotional rewards
          </div>
        </div>

        {/* Gems Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gem-text)', fontSize: '0.8rem', fontWeight: 600 }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Gem size={15} color="currentColor" />
            </div>
            <span>Gems</span>
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.65rem', fontWeight: 700, marginTop: '0.75rem', color: 'var(--text-primary)' }}>
            {Number(wallet.gems || 0).toLocaleString()}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.25rem' }}>
            Multiplier boosts & VIP perks
          </div>
        </div>

        {/* Tokens Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-token-text)', fontSize: '0.8rem', fontWeight: 600 }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={15} color="currentColor" />
            </div>
            <span>Tokens</span>
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.65rem', fontWeight: 700, marginTop: '0.75rem', color: 'var(--text-primary)' }}>
            {Number(wallet.tokens || 0).toLocaleString()}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.25rem' }}>
            Quest & milestone completions
          </div>
        </div>

        {/* Spins Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-spin-text)', fontSize: '0.8rem', fontWeight: 600 }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Disc size={15} color="currentColor" />
            </div>
            <span>Lucky Spins</span>
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.65rem', fontWeight: 700, marginTop: '0.75rem', color: 'var(--text-primary)' }}>
            {Number(wallet.spins || 0).toLocaleString()}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.25rem' }}>
            Wheel rotations remaining
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
            padding: '1.15rem 1.5rem',
            background: 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="var(--color-credit)" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
                Lifetime Earned
              </div>
              <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-credit)', marginTop: '0.15rem' }}>
                +{Number(metrics.totalCreditedVEs || 0).toLocaleString()} VEs
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={18} color="var(--color-debit)" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
                Lifetime Redeemed
              </div>
              <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-debit)', marginTop: '0.15rem' }}>
                -{Number(metrics.totalDebitedVEs || 0).toLocaleString()} VEs
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coins size={18} color="var(--accent-ve)" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
                Net Ledger Balance
              </div>
              <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-ve)', marginTop: '0.15rem' }}>
                {Number(metrics.netVEsBalance || wallet.ves || 0).toLocaleString()} VEs
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
