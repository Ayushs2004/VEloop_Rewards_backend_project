import React, { useState } from 'react';
import {
  Gift,
  Sparkles,
  Zap,
  Disc,
  Share2,
  Trophy,
  Check,
  Copy,
  ChevronRight,
  Flame,
  ShieldCheck,
  Coins
} from 'lucide-react';

export const EcosystemRewardsHub = ({ wallet, onNavigateToPayout }) => {
  const [streakClaimed, setStreakClaimed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState('streak'); // 'streak' | 'spins' | 'quests' | 'referrals'
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [spinsLeft, setSpinsLeft] = useState(wallet?.spins || 3);

  const streakDays = [
    { day: 1, reward: '+50 VEs', done: true },
    { day: 2, reward: '+75 VEs', done: true },
    { day: 3, reward: '+100 VEs', done: true },
    { day: 4, reward: '+150 VEs', active: !streakClaimed, done: streakClaimed },
    { day: 5, reward: '+200 VEs', done: false },
    { day: 6, reward: '+300 VEs', done: false },
    { day: 7, reward: 'Mystery Box', done: false, bonus: true }
  ];

  const handleClaimStreak = () => {
    if (streakClaimed) return;
    setStreakClaimed(true);
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText('VELOOP-REWARDS-2026');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSpinWheel = () => {
    if (spinning || spinsLeft <= 0) return;
    setSpinning(true);
    setSpinResult(null);

    setTimeout(() => {
      const outcomes = ['+100 VEs', '+25 SVEs', '+10 Gems', '+50 VEs', '+5 Tokens'];
      const won = outcomes[Math.floor(Math.random() * outcomes.length)];
      setSpinResult(won);
      setSpinsLeft((prev) => Math.max(0, prev - 1));
      setSpinning(false);
    }, 1200);
  };

  return (
    <div className="glass-card" style={{ marginBottom: '2.5rem', padding: '1.75rem' }}>
      {/* Header & Section Title */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 15px rgba(236, 72, 153, 0.35)'
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Ecosystem Rewards Hub</h3>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '0.12rem 0.5rem',
                  borderRadius: '9999px',
                  letterSpacing: '0.04em'
                }}
              >
                ● Connected Journey
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
              Engage with ecosystem capabilities to earn multi-currency bonuses and cashout rewards
            </p>
          </div>
        </div>

        {/* Segmented Activity Switcher */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-input)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            gap: '2px'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('streak')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: activeTab === 'streak' ? 600 : 500,
              color: activeTab === 'streak' ? 'var(--text-primary)' : 'var(--text-muted)',
              background: activeTab === 'streak' ? 'var(--bg-card)' : 'transparent',
              boxShadow: activeTab === 'streak' ? 'var(--shadow-card)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.16s ease'
            }}
          >
            <Flame size={13} color={activeTab === 'streak' ? '#f59e0b' : 'currentColor'} />
            <span>Daily Streak</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('spins')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: activeTab === 'spins' ? 600 : 500,
              color: activeTab === 'spins' ? 'var(--text-primary)' : 'var(--text-muted)',
              background: activeTab === 'spins' ? 'var(--bg-card)' : 'transparent',
              boxShadow: activeTab === 'spins' ? 'var(--shadow-card)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.16s ease'
            }}
          >
            <Disc size={13} color={activeTab === 'spins' ? '#f59e0b' : 'currentColor'} />
            <span>Lucky Spin</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quests')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: activeTab === 'quests' ? 600 : 500,
              color: activeTab === 'quests' ? 'var(--text-primary)' : 'var(--text-muted)',
              background: activeTab === 'quests' ? 'var(--bg-card)' : 'transparent',
              boxShadow: activeTab === 'quests' ? 'var(--shadow-card)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.16s ease'
            }}
          >
            <Trophy size={13} color={activeTab === 'quests' ? '#8b5cf6' : 'currentColor'} />
            <span>Quests</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('referrals')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: activeTab === 'referrals' ? 600 : 500,
              color: activeTab === 'referrals' ? 'var(--text-primary)' : 'var(--text-muted)',
              background: activeTab === 'referrals' ? 'var(--bg-card)' : 'transparent',
              boxShadow: activeTab === 'referrals' ? 'var(--shadow-card)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.16s ease'
            }}
          >
            <Share2 size={13} color={activeTab === 'referrals' ? '#38bdf8' : 'currentColor'} />
            <span>Referrals</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DAILY STREAK CHECK-IN */}
      {activeTab === 'streak' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                🔥 4-Day Check-In Streak
              </span>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Check in consecutive days to multiply rewards and unlock the Day 7 Mystery Vault
              </p>
            </div>
            <button
              type="button"
              className={streakClaimed ? 'btn-secondary' : 'btn-primary'}
              onClick={handleClaimStreak}
              disabled={streakClaimed}
              style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
            >
              {streakClaimed ? (
                <>
                  <Check size={14} color="#34d399" />
                  <span>Day 4 Claimed!</span>
                </>
              ) : (
                <>
                  <Zap size={14} />
                  <span>Claim Today (+150 VEs)</span>
                </>
              )}
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))',
              gap: '0.65rem'
            }}
          >
            {streakDays.map((s) => (
              <div
                key={s.day}
                style={{
                  background: s.active
                    ? 'rgba(99, 102, 241, 0.15)'
                    : s.done
                    ? 'rgba(16, 185, 129, 0.08)'
                    : 'var(--bg-input)',
                  border: `1px solid ${
                    s.active
                      ? 'var(--primary)'
                      : s.done
                      ? 'rgba(16, 185, 129, 0.3)'
                      : 'var(--border-subtle)'
                  }`,
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 0.5rem',
                  textAlign: 'center',
                  boxShadow: s.active ? '0 0 12px rgba(99, 102, 241, 0.25)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '0.72rem', color: s.done ? '#34d399' : 'var(--text-muted)', fontWeight: 600 }}>
                  Day {s.day}
                </div>
                <div
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    marginTop: '0.35rem',
                    color: s.bonus ? '#f59e0b' : s.done ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}
                >
                  {s.reward}
                </div>
                <div style={{ marginTop: '0.45rem', fontSize: '0.68rem' }}>
                  {s.done ? (
                    <span style={{ color: '#34d399', fontWeight: 700 }}>✓ Claimed</span>
                  ) : s.active ? (
                    <span style={{ color: '#818cf8', fontWeight: 700 }}>Ready!</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Locked</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LUCKY SPINS WHEEL */}
      {activeTab === 'spins' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 700 }}>
              <Disc size={16} />
              <span>Lucky Wheel Spin</span>
              <span className="tabular-nums" style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                {spinsLeft} Spins Available
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.35rem', maxWidth: '420px', lineHeight: 1.45 }}>
              Use your accumulated spins from daily logins and achievements to win instant VEs, rare Gems, and multiplier boosters.
            </p>
            {spinResult && (
              <div
                style={{
                  marginTop: '0.85rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <Sparkles size={14} />
                <span>Congratulations! You won: {spinResult}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSpinWheel}
              disabled={spinning || spinsLeft <= 0}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.9rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderColor: 'rgba(245, 158, 11, 0.4)',
                boxShadow: '0 4px 18px rgba(245, 158, 11, 0.35)'
              }}
            >
              <Disc size={16} className={spinning ? 'spin' : ''} />
              <span>{spinning ? 'Spinning...' : spinsLeft > 0 ? `Spin Now (${spinsLeft} Left)` : 'No Spins Left'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVE QUESTS */}
      {activeTab === 'quests' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
          <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Account Activation</span>
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>✓ Completed</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Create account and verify seed wallet (+25,000 VEs)
            </div>
            <div style={{ height: '4px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '2px', marginTop: '0.65rem' }}>
              <div style={{ width: '100%', height: '100%', background: '#10b981', borderRadius: '2px' }} />
            </div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>First Payout Milestone</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>1/1 Redemptions</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Submit your first UPI or voucher cashout (+500 VEs bonus)
            </div>
            <div style={{ height: '4px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '2px', marginTop: '0.65rem' }}>
              <div style={{ width: '100%', height: '100%', background: 'var(--primary)', borderRadius: '2px' }} />
            </div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Gold Tier Milestone</span>
              <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>25k / 50k VEs</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Accumulate 50,000 lifetime VEs to unlock VIP multiplier
            </div>
            <div style={{ height: '4px', background: 'rgba(245, 158, 11, 0.2)', borderRadius: '2px', marginTop: '0.65rem' }}>
              <div style={{ width: '50%', height: '100%', background: '#f59e0b', borderRadius: '2px' }} />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REFERRAL INVITATIONS */}
      {activeTab === 'referrals' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>
              🤝 Invite Friends & Earn Together
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.25rem', maxWidth: '440px', lineHeight: 1.45 }}>
              Share your personal invite link. For each friend who registers and verifies their wallet, you both receive 500 VEs + 2 Lucky Wheel Spins.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: 'var(--bg-input)',
                padding: '0.55rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              VELOOP-REWARDS-2026
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={handleCopyReferral}
              style={{ padding: '0.55rem 0.95rem', fontSize: '0.85rem' }}
            >
              {copiedCode ? <Check size={14} color="#fff" /> : <Copy size={14} />}
              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
