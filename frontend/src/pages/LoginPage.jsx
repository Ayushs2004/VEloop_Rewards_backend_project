import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Coins,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  RefreshCw
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const LoginPage = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register({ email, password, name });
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = () => {
    setIsRegister(false);
    setEmail('demo@veloop.test');
    setPassword('Password123!');
    setError(null);
  };

  const fillDemoAdmin = () => {
    setIsRegister(false);
    setEmail('admin@veloop.test');
    setPassword('AdminPass123!');
    setError(null);
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto 2.5rem', padding: '0 1rem' }} className="fade-in">
      {/* Top Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
        <ThemeToggle showLabel={true} />
      </div>

      {/* Brand Header - velooprewards.in Identity */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 1.1rem',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #181a2a 0%, #232547 100%)',
            border: '2px solid rgba(255, 193, 7, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 28px -4px rgba(255, 193, 7, 0.35)',
            color: '#ffc107'
          }}
        >
          <Coins size={30} />
        </div>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 900, fontFamily: 'Poppins, sans-serif', letterSpacing: '0.02em' }}>
          <span style={{ color: '#ffc107' }}>VE</span>
          <span style={{ color: 'var(--text-primary)' }}>Loop</span>{' '}
          <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Rewards</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.4rem', lineHeight: 1.5 }}>
          {isRegister
            ? 'Open your verified rewards account & activate wallet'
            : 'Watch ads, complete tasks & redeem instant cashouts via UPI or PayPal'}
        </p>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        {/* Quick Demo Access Bar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            padding: '0.75rem',
            marginBottom: '1.5rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.05)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Instant Demo Access
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-ve-text)' }}>1-Click Fill</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              className="copy-pill"
              onClick={fillDemoUser}
              title="Fill regular user demo credentials"
              style={{ padding: '0.45rem', justifyContent: 'center' }}
            >
              <User size={13} />
              <span>Demo User</span>
            </button>
            <button
              type="button"
              className="copy-pill"
              onClick={fillDemoAdmin}
              title="Fill administrative demo credentials"
              style={{ padding: '0.45rem', justifyContent: 'center', color: '#f472b6', borderColor: 'rgba(244, 114, 182, 0.3)' }}
            >
              <ShieldCheck size={13} />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        {/* Segmented Auth Mode Switch */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            padding: '3px',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            style={{
              padding: '0.6rem',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: !isRegister ? 'var(--text-primary)' : 'var(--text-muted)',
              background: !isRegister ? 'var(--bg-card)' : 'transparent',
              boxShadow: !isRegister ? 'var(--shadow-card)' : 'none',
              transition: 'all 0.16s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            style={{
              padding: '0.6rem',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: isRegister ? 'var(--text-primary)' : 'var(--text-muted)',
              background: isRegister ? 'var(--bg-card)' : 'transparent',
              boxShadow: isRegister ? 'var(--shadow-card)' : 'none',
              transition: 'all 0.16s ease'
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="alert-banner error" style={{ padding: '0.8rem 1rem', marginBottom: '1.25rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group" style={{ marginBottom: '1.1rem' }}>
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ayush Soni"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <User
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.9rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.9rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
              />
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.9rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {isRegister && (
              <span
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.4rem',
                  display: 'block',
                  lineHeight: 1.4
                }}
              >
                8–15 chars with uppercase, lowercase, number & special symbol.
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '0.95rem', fontWeight: 700 }}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="spin" />
                <span>Authenticating...</span>
              </>
            ) : isRegister ? (
              <>
                <span>Register & Open Wallet</span>
                <ArrowRight size={16} />
              </>
            ) : (
              <>
                <span>Sign In to Wallet</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Security & System Assurances */}
      <div
        style={{
          marginTop: '1.75rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          textAlign: 'center',
          fontSize: '0.7rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
          <ShieldCheck size={16} color="#10b981" />
          <span>Option A Escrow</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
          <Lock size={16} color="var(--primary)" />
          <span>256-bit Encrypted</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
          <Coins size={16} color="var(--accent-ve-text)" />
          <span>Atomic Ledger</span>
        </div>
      </div>
    </div>
  );
};
