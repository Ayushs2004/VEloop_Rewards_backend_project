import React, { useState } from 'react';
import {
  Sparkles,
  Disc,
  Share2,
  Check,
  Copy,
  Flame,
  Play,
  RotateCw
} from 'lucide-react';

export const EcosystemRewardsHub = ({ wallet, onNavigateToPayout }) => {
  const [streakClaimed, setStreakClaimed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [spinsLeft, setSpinsLeft] = useState(wallet?.spins || 3);
  const [watchingAd, setWatchingAd] = useState(false);
  const [adSuccess, setAdSuccess] = useState(false);

  const streakDays = [
    { day: 1, reward: '+50', done: true },
    { day: 2, reward: '+75', done: true },
    { day: 3, reward: '+100', done: true },
    { day: 4, reward: '+150', active: !streakClaimed, done: streakClaimed },
    { day: 5, reward: '+200', done: false },
    { day: 6, reward: '+300', done: false },
    { day: 7, reward: '🎁', done: false, bonus: true }
  ];

  const handleClaimStreak = () => {
    if (streakClaimed) return;
    setStreakClaimed(true);
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText('https://www.velooprewards.in/ref/VELOOP2026');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSpinWheel = () => {
    if (spinning || spinsLeft <= 0) return;
    setSpinning(true);
    setSpinResult(null);
    setTimeout(() => {
      const outcomes = ['+150 VEs', '+50 SVEs', '+15 Gems', '+100 VEs', '+10 Tokens'];
      setSpinResult(outcomes[Math.floor(Math.random() * outcomes.length)]);
      setSpinsLeft((prev) => Math.max(0, prev - 1));
      setSpinning(false);
    }, 1500);
  };

  const handleWatchAd = () => {
    if (watchingAd) return;
    setWatchingAd(true);
    setAdSuccess(false);
    setTimeout(() => {
      setWatchingAd(false);
      setAdSuccess(true);
      setTimeout(() => setAdSuccess(false), 3000);
    }, 2000);
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'ads', label: 'Ads' },
    { id: 'streak', label: 'Streak' },
    { id: 'spins', label: 'Spin' },
    { id: 'referrals', label: 'Refer' }
  ];

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} style={{ color: 'var(--accent-ve)' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Earn Rewards</h2>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.2rem', background: 'var(--bg-input)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '5px',
                fontSize: '0.78rem',
                fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modules Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>

        {/* Watch Ads */}
        {(activeTab === 'all' || activeTab === 'ads') && (
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Play size={16} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Watch Ads</h3>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent-ve)', background: 'rgba(245, 158, 11, 0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                  +100 VEs
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                Watch short sponsored videos. Rewards credited directly to your wallet.
              </p>
            </div>

            {adSuccess && (
              <div style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--color-credit)', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Check size={14} />
                <span>+100 VEs credited!</span>
              </div>
            )}

            <button
              type="button"
              className="btn-primary"
              onClick={handleWatchAd}
              disabled={watchingAd}
              style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem' }}
            >
              {watchingAd ? (
                <>
                  <RotateCw size={14} className="spin" />
                  <span>Watching...</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>Watch Ad</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Daily Streak */}
        {(activeTab === 'all' || activeTab === 'streak') && (
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Flame size={16} style={{ color: 'var(--accent-ve)' }} />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Daily Streak</h3>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Day 4</span>
              </div>

              {/* 7-Day Tracker */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '1rem' }}>
                {streakDays.map((s) => (
                  <div
                    key={s.day}
                    style={{
                      padding: '0.4rem 0.15rem',
                      borderRadius: '6px',
                      textAlign: 'center',
                      background: s.done
                        ? 'rgba(16, 185, 129, 0.1)'
                        : s.active
                        ? 'var(--primary-light)'
                        : 'var(--bg-input)',
                      border: s.active
                        ? '1px solid var(--primary-border)'
                        : '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>D{s.day}</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: s.done ? 'var(--color-credit)' : s.active ? 'var(--primary)' : 'var(--text-secondary)', marginTop: '0.1rem' }}>
                      {s.done ? <Check size={10} style={{ margin: '0 auto' }} /> : s.reward}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={handleClaimStreak}
              disabled={streakClaimed}
              style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem' }}
            >
              {streakClaimed ? '✓ Day 4 Claimed' : 'Claim Day 4 (+150 VEs)'}
            </button>
          </div>
        )}

        {/* Lucky Spin */}
        {(activeTab === 'all' || activeTab === 'spins') && (
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Disc size={16} style={{ color: 'var(--accent-gem)' }} />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Lucky Spin</h3>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {spinsLeft} left
                </span>
              </div>

              {/* Wheel */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0.75rem 0' }}>
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: `conic-gradient(var(--primary) 0deg 120deg, var(--accent-ve) 120deg 240deg, var(--accent-token) 240deg 360deg)`,
                    border: '3px solid var(--border-strong)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: spinning ? 'spin 0.4s linear infinite' : 'none'
                  }}
                >
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%', background: 'var(--bg-primary)', border: '2px solid var(--border-strong)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', fontSize: '0.65rem', fontWeight: 800
                  }}>
                    VE
                  </div>
                </div>
              </div>

              {spinResult && (
                <div style={{ textAlign: 'center', padding: '0.4rem', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '6px', color: 'var(--accent-ve)', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.5rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  🎉 Won {spinResult}!
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={handleSpinWheel}
              disabled={spinning || spinsLeft <= 0}
              style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem' }}
            >
              {spinning ? 'Spinning...' : spinsLeft > 0 ? `Spin (${spinsLeft} left)` : 'No Spins Left'}
            </button>
          </div>
        )}

        {/* Referrals */}
        {(activeTab === 'all' || activeTab === 'referrals') && (
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Share2 size={16} style={{ color: 'var(--accent-ve)' }} />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Refer & Earn</h3>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-credit)' }}>10% bonus</span>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                Share your referral link. Earn 10% commission on friends' payouts.
              </p>

              <div style={{
                background: 'var(--bg-input)',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.85rem'
              }}>
                <span className="font-mono" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  VELOOP-REWARDS-2026
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={handleCopyReferral}
              style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem' }}
            >
              {copiedCode ? (
                <>
                  <Check size={14} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Referral Link</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
