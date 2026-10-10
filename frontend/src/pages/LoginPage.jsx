import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Coins, Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

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
    <div style={{ maxWidth: '420px', margin: '4.5rem auto 3rem', padding: '0 1rem' }} className="fade-in">
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            margin: '0 auto 1rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px -4px rgba(79, 70, 229, 0.45)',
            color: '#fff'
          }}
        >
          <Coins size={24} />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>VELoop Rewards</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
          {isRegister ? 'Create an account to activate your rewards wallet' : 'Sign in to manage balances & redeem payouts'}
        </p>
      </div>

      <div className="glass-card">
        {/* Quick Demo Access Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 0.75rem',
            marginBottom: '1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Quick fill:
          </span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              type="button"
              className="copy-pill"
              onClick={fillDemoUser}
              title="Populate demo user credentials"
            >
              Demo User
            </button>
            <button
              type="button"
              className="copy-pill"
              onClick={fillDemoAdmin}
              title="Populate admin credentials"
              style={{ color: '#f472b6' }}
            >
              Admin Demo
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
            onClick={() => { setIsRegister(false); setError(null); }}
            style={{
              padding: '0.55rem',
              borderRadius: '7px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: !isRegister ? '#ffffff' : 'var(--text-muted)',
              background: !isRegister ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              boxShadow: !isRegister ? '0 1px 3px rgba(0, 0, 0, 0.3)' : 'none',
              transition: 'all 0.16s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(null); }}
            style={{
              padding: '0.55rem',
              borderRadius: '7px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: isRegister ? '#ffffff' : 'var(--text-muted)',
              background: isRegister ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              boxShadow: isRegister ? '0 1px 3px rgba(0, 0, 0, 0.3)' : 'none',
              transition: 'all 0.16s ease'
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="alert-banner error" style={{ padding: '0.75rem 0.95rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex Morgan"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '2.4rem' }}
                />
                <User
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
              />
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
              />
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
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
                  right: '0.8rem',
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
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'block', lineHeight: 1.4 }}>
                8–15 chars with uppercase, lowercase, number & special character.
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem 1rem' }}
          >
            {loading ? (
              <span>Authenticating...</span>
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
    </div>
  );
};
