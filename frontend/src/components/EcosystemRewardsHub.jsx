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
  Coins,
  Play,
  RotateCw,
  ExternalLink,
  Award
} from 'lucide-react';

export const EcosystemRewardsHub = ({ wallet, onNavigateToPayout }) => {
  const [streakClaimed, setStreakClaimed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'ads' | 'streak' | 'spins' | 'referrals'
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [spinsLeft, setSpinsLeft] = useState(wallet?.spins || 3);
  const [watchingAd, setWatchingAd] = useState(false);
  const [adSuccess, setAdSuccess] = useState(false);

  const streakDays = [
    { day: 1, reward: '+50 VEs', done: true },
    { day: 2, reward: '+75 VEs', done: true },
    { day: 3, reward: '+100 VEs', done: true },
    { day: 4, reward: '+150 VEs', active: !streakClaimed, done: streakClaimed },
    { day: 5, reward: '+200 VEs', done: false },
    { day: 6, reward: '+300 VEs', done: false },
    { day: 7, reward: 'Mystery Chest', done: false, bonus: true }
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
      const won = outcomes[Math.floor(Math.random() * outcomes.length)];
      setSpinResult(won);
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

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      {/* Section Header with velooprewards.in styling */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10121d',
              boxShadow: '0 6px 20px rgba(255, 193, 7, 0.4)'
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, fontFamily: 'Poppins, sans-serif' }}>
                Earning & Rewards Hub
              </h2>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  background: 'rgba(0, 255, 195, 0.15)',
                  color: '#00ffc3',
                  border: '1px solid rgba(0, 255, 195, 0.35)',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '9999px',
                  letterSpacing: '0.04em'
                }}
              >
                ● Connected System
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Watch ads, complete tasks, spin the wheel, and redeem real cash online – Only on VELoop Rewards
            </p>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-input)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            gap: '2px',
            flexWrap: 'wrap'
          }}
        >
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'ads', label: 'Watch Ads' },
            { id: 'streak', label: 'Daily Streak' },
            { id: 'spins', label: 'Lucky Wheel' },
            { id: 'referrals', label: 'Refer & Earn' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: activeTab === tab.id ? 700 : 600,
                color: activeTab === tab.id ? '#10121d' : 'var(--text-muted)',
                background: activeTab === tab.id ? '#ffc107' : 'transparent',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(255, 193, 7, 0.3)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.18s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Interactive Modules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* MODULE 1: WATCH ADS & EARN REAL CASH ONLINE (velooprewards.in Signature) */}
        {(activeTab === 'all' || activeTab === 'ads') && (
          <div
            className="glass-card"
            style={{
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(35, 37, 71, 0.95), rgba(28, 30, 53, 0.95))',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)'
                    }}
                  >
                    <Play size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>
                      Watch Ads & Earn VEs
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 700 }}>
                      Verified Partner Network
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#ffc107',
                    background: 'rgba(255, 193, 7, 0.12)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 193, 7, 0.3)'
                  }}
                >
                  +100 VEs / Ad
                </span>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Watch short sponsored videos with zero investment. Real cash rewards credited directly to your authoritative wallet ledger.
              </p>
            </div>

            <div>
              {adSuccess && (
                <div
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(0, 255, 195, 0.15)',
                    border: '1px solid rgba(0, 255, 195, 0.35)',
                    color: '#00ffc3',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    marginBottom: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <Check size={16} />
                  <span>Ad Completed! +100 VEs logged to your account.</span>
                </div>
              )}

              <button
                type="button"
                className="btn-primary"
                onClick={handleWatchAd}
                disabled={watchingAd}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.45)'
                }}
              >
                {watchingAd ? (
                  <>
                    <RotateCw size={16} className="spin" />
                    <span>Streaming Ad (2s)...</span>
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    <span>Watch Sponsored Ad (+100 VEs)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* MODULE 2: DAILY STREAK CHECK-IN BANNER */}
        {(activeTab === 'all' || activeTab === 'streak') && (
          <div
            className="glass-card"
            style={{
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(18, 27, 48, 0.95) 0%, rgba(35, 47, 66, 0.95) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.28)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'linear-gradient(180deg, rgba(251, 191, 36, 0.25), rgba(245, 158, 11, 0.15))',
                      border: '1px solid rgba(251, 191, 36, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fde68a'
                    }}
                  >
                    <Flame size={22} color="#f59e0b" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>
                      Daily Streak Bonus
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#fde68a', fontWeight: 700 }}>
                      Current Streak: Day 4 Active
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#00ffc3',
                    background: 'rgba(0, 255, 195, 0.12)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px'
                  }}
                >
                  Day 7 = Mystery Chest
                </span>
              </div>

              {/* 7-Day Streak Tracker */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '0.35rem',
                  marginBottom: '1.25rem'
                }}
              >
                {streakDays.map((s) => (
                  <div
                    key={s.day}
                    style={{
                      padding: '0.5rem 0.2rem',
                      borderRadius: '8px',
                      textAlign: 'center',
                      background: s.done
                        ? 'rgba(0, 255, 195, 0.12)'
                        : s.active
                        ? 'rgba(255, 193, 7, 0.2)'
                        : 'rgba(255, 255, 255, 0.04)',
                      border: s.done
                        ? '1px solid rgba(0, 255, 195, 0.35)'
                        : s.active
                        ? '1px solid #ffc107'
                        : '1px solid var(--border-subtle)',
                      boxShadow: s.active ? '0 0 12px rgba(255, 193, 7, 0.35)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      D{s.day}
                    </div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: s.done ? '#00ffc3' : s.active ? '#ffc107' : 'var(--text-primary)', marginTop: '0.2rem' }}>
                      {s.done ? <Check size={12} style={{ margin: '0 auto' }} /> : s.reward}
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
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.92rem',
                fontWeight: 900,
                background: streakClaimed
                  ? 'rgba(0, 255, 195, 0.15)'
                  : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                color: streakClaimed ? '#00ffc3' : '#181a2a',
                border: streakClaimed ? '1px solid rgba(0, 255, 195, 0.3)' : 'none',
                boxShadow: streakClaimed ? 'none' : '0 10px 26px rgba(245, 158, 11, 0.35)'
              }}
            >
              {streakClaimed ? '✓ Day 4 Claimed (+150 VEs)' : 'Claim Day 4 Reward (+150 VEs)'}
            </button>
          </div>
        )}

        {/* MODULE 3: LUCKY SPIN WHEEL */}
        {(activeTab === 'all' || activeTab === 'spins') && (
          <div
            className="glass-card"
            style={{
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(35, 37, 71, 0.95), rgba(28, 30, 53, 0.95))',
              border: '1px solid rgba(255, 110, 169, 0.3)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #ff6ea9, #7c5cff)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      boxShadow: '0 8px 20px rgba(255, 110, 169, 0.35)'
                    }}
                  >
                    <Disc size={20} className={spinning ? 'spin' : ''} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>
                      Lucky Spin Wheel
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#ff9dc5', fontWeight: 700 }}>
                      {spinsLeft} Spins Available
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#ffc850',
                    background: 'rgba(255, 200, 80, 0.12)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px'
                  }}
                >
                  Up to +500 VEs
                </span>
              </div>

              {/* Wheel Graphic */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem 0' }}>
                <div
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: 'conic-gradient(#ff6ea9 0deg 72deg, #7c5cff 72deg 144deg, #4da8ff 144deg 216deg, #00ffc3 216deg 288deg, #ffc107 288deg 360deg)',
                    border: '4px solid rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                    animation: spinning ? 'spin 0.4s linear infinite' : 'none'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#10121d',
                      border: '2px solid #ffc107',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffc107',
                      fontSize: '0.75rem',
                      fontWeight: 900
                    }}
                  >
                    VE
                  </div>
                </div>
              </div>

              {spinResult && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '0.55rem',
                    background: 'rgba(255, 193, 7, 0.12)',
                    borderRadius: '8px',
                    color: '#ffc107',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    marginBottom: '0.75rem',
                    border: '1px solid rgba(255, 193, 7, 0.3)'
                  }}
                >
                  🎉 You Won {spinResult}!
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={handleSpinWheel}
              disabled={spinning || spinsLeft <= 0}
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.92rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #ff6ea9, #7c5cff)',
                boxShadow: '0 8px 24px rgba(255, 110, 169, 0.35)'
              }}
            >
              {spinning ? 'Wheel is Rotating...' : spinsLeft > 0 ? `Spin the Wheel (${spinsLeft} left)` : 'No Spins Remaining'}
            </button>
          </div>
        )}

        {/* MODULE 4: REFERRAL BONUS HUB */}
        {(activeTab === 'all' || activeTab === 'referrals') && (
          <div
            className="glass-card"
            style={{
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(35, 37, 71, 0.95), rgba(28, 30, 53, 0.95))',
              border: '1px solid rgba(255, 193, 7, 0.3)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #ffc107, #ff9800)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10121d',
                      boxShadow: '0 8px 20px rgba(255, 193, 7, 0.35)'
                    }}
                  >
                    <Share2 size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>
                      Invite Friends & Earn
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#ffc107', fontWeight: 700 }}>
                      10% Lifetime Payout Bonus
                    </span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Share your referral link with friends. Whenever they complete an instant cashout, you receive a 10% commission credited automatically.
              </p>

              <div
                style={{
                  background: 'var(--bg-input)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}
              >
                <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  VELOOP-REWARDS-2026
                </span>
                <span style={{ fontSize: '0.72rem', color: '#00ffc3', fontWeight: 700 }}>Active Code</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={handleCopyReferral}
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.92rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #ffc107, #ff9800)',
                color: '#10121d',
                boxShadow: '0 8px 24px rgba(255, 193, 7, 0.35)'
              }}
            >
              {copiedCode ? '✓ Referral Link Copied!' : 'Copy Referral Invitation Link'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
