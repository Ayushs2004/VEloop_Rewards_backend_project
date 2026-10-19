import React, { useState, useEffect } from 'react';
import { payoutApi, withdrawalApi, walletApi } from '../api/client';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  CreditCard,
  Mail,
  ArrowRight,
  Smartphone,
  Gift,
  Copy,
  Check,
  Clock,
  Coins,
  Lock,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export const PayoutPage = ({ onBackToWallet }) => {
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [payoutDetails, setPayoutDetails] = useState({ upiId: '', email: '' });
  const [userBalance, setUserBalance] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Choose Option, 2: Review & Confirm, 3: Success
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(
    `idem_${Date.now()}_${Math.random().toString(36).substring(7)}`
  );

  // Load methods and user balance on mount
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [methodsRes, walletRes] = await Promise.all([
          payoutApi.getMethods(),
          walletApi.getWallet()
        ]);

        if (methodsRes.success) {
          setMethods(methodsRes.data);
          const firstActive = methodsRes.data.find((m) => m.active);
          if (firstActive) {
            setSelectedMethod(firstActive);
          }
        }
        if (walletRes.success) {
          setUserBalance(walletRes.data.ves || 0);
        }
      } catch (err) {
        setError(err.message || 'Failed to initialize payout methods');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // When selectedMethod changes, fetch available denominations
  useEffect(() => {
    if (!selectedMethod) return;

    const loadOptions = async () => {
      try {
        setError(null);
        setSelectedOption(null);
        const res = await payoutApi.getOptionsByMethod(selectedMethod.method);
        if (res.success) {
          setOptions(res.data);
          if (res.data.length > 0) {
            setSelectedOption(res.data[0]);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch options for payout method');
      }
    };

    loadOptions();
  }, [selectedMethod]);

  const handleProceedToConfirmation = (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedOption) {
      setError('Please select a payout denomination.');
      return;
    }

    if (userBalance < selectedOption.requiredAmount) {
      setError(
        `Insufficient VEs balance. This payout requires ${selectedOption.requiredAmount.toLocaleString()} VEs, but your current balance is ${userBalance.toLocaleString()} VEs.`
      );
      return;
    }

    if (selectedMethod.method === 'UPI' && !payoutDetails.upiId.trim()) {
      setError('Please enter a valid UPI ID / Virtual Payment Address (e.g. yourname@oksbi or 9876543210@paytm).');
      return;
    }

    if (
      ['PAYPAL', 'AMAZON_GIFT_CARD', 'GOOGLE_PLAY_GIFT_CARD'].includes(selectedMethod.method) &&
      !payoutDetails.email.trim()
    ) {
      setError('Please enter a valid recipient email address.');
      return;
    }

    setStep(2);
  };

  const handleConfirmAndWithdraw = async () => {
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        method: selectedMethod.method,
        optionId: selectedOption.optionId,
        payoutDetails:
          selectedMethod.method === 'UPI'
            ? { upiId: payoutDetails.upiId.trim() }
            : { email: payoutDetails.email.trim().toLowerCase() }
      };

      const res = await withdrawalApi.create(payload, idempotencyKey);

      if (res.success) {
        setSuccessData(res);
        setStep(3);
      }
    } catch (err) {
      setError(err.message || 'Payout request failed. Please check your balance or payout details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleResetForAnother = () => {
    setStep(1);
    setSuccessData(null);
    setIdempotencyKey(`idem_${Date.now()}_${Math.random().toString(36).substring(7)}`);
    // refresh wallet balance
    walletApi.getWallet().then((res) => {
      if (res.success) setUserBalance(res.data.ves || 0);
    });
  };

  const getMethodIcon = (methodCode) => {
    switch (methodCode) {
      case 'UPI':
        return <Smartphone size={20} color="#38bdf8" />;
      case 'PAYPAL':
        return <CreditCard size={20} color="#818cf8" />;
      case 'AMAZON_GIFT_CARD':
      case 'GOOGLE_PLAY_GIFT_CARD':
        return <Gift size={20} color="#fbbf24" />;
      default:
        return <Coins size={20} color="#a78bfa" />;
    }
  };

  const getMethodBadge = (methodCode) => {
    switch (methodCode) {
      case 'UPI':
        return { text: 'Direct Bank UPI', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)' };
      case 'PAYPAL':
        return { text: 'Global Wallet', color: '#818cf8', bg: 'rgba(129, 140, 248, 0.12)' };
      case 'AMAZON_GIFT_CARD':
        return { text: 'Amazon Voucher', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)' };
      case 'GOOGLE_PLAY_GIFT_CARD':
        return { text: 'Play Code', color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)' };
      default:
        return { text: 'Digital Voucher', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.12)' };
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem', color: 'var(--text-secondary)' }}>
        <RefreshCw size={28} className="spin" style={{ color: '#818cf8', margin: '0 auto 1rem' }} />
        <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Loading verified payout channels & denominations...</p>
      </div>
    );
  }

  const estimatedInrTotal = (userBalance / 240).toFixed(2);

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }} className="fade-in">
      {/* Top Header & Breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onBackToWallet}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
          >
            <ArrowLeft size={14} />
            <span>Wallet</span>
          </button>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Redeem Rewards
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.15rem' }}>
              Convert verified VEs into instant cash or digital gift cards
            </p>
          </div>
        </div>

        {/* Live Balance Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.45rem 0.95rem',
            borderRadius: '9999px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Balance:</span>
          <strong className="tabular-nums font-mono" style={{ color: 'var(--accent-ve)', fontWeight: 700 }}>
            {userBalance.toLocaleString()} VEs
          </strong>
          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--color-credit)',
              fontWeight: 700,
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '0.15rem 0.4rem',
              borderRadius: '4px'
            }}
          >
            ≈ ₹{estimatedInrTotal}
          </span>
        </div>
      </div>

      {/* Modern Visual Stepper */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          padding: '0.85rem 1.5rem',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: step >= 1 ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'var(--bg-input)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 700,
              boxShadow: step === 1 ? '0 0 12px rgba(99, 102, 241, 0.5)' : 'none'
            }}
          >
            {step > 1 ? <Check size={14} /> : '1'}
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: step >= 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              Channel & Amount
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Select method & denomination</div>
          </div>
        </div>

        <div style={{ flex: 1, height: '2px', background: step >= 2 ? 'var(--primary)' : 'var(--border-subtle)', margin: '0 0.5rem' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: step >= 2 ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'var(--bg-input)',
              color: step >= 2 ? '#fff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 700,
              boxShadow: step === 2 ? '0 0 12px rgba(99, 102, 241, 0.5)' : 'none'
            }}
          >
            {step > 2 ? <Check size={14} /> : '2'}
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: step >= 2 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              Security Review
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Option A Escrow lock</div>
          </div>
        </div>

        <div style={{ flex: 1, height: '2px', background: step >= 3 ? '#10b981' : 'var(--border-subtle)', margin: '0 0.5rem' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: step === 3 ? 'linear-gradient(135deg, #059669, #10b981)' : 'var(--bg-input)',
              color: step === 3 ? '#fff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 700,
              boxShadow: step === 3 ? '0 0 12px rgba(16, 185, 129, 0.5)' : 'none'
            }}
          >
            3
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: step === 3 ? '#10b981' : 'var(--text-muted)' }}>
              Receipt
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Settlement confirmation</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert-banner error" style={{ marginBottom: '1.5rem' }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: METHOD & DENOMINATION SELECTION */}
      {step === 1 && (
        <div>
          {/* Section 1: Payout Channel Cards */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.92rem', margin: 0 }}>
                1. Select Payout Channel
              </label>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {methods.filter((m) => m.active).length} channels operational
              </span>
            </div>

            <div className="payout-methods-grid">
              {methods.map((m) => {
                const isSelected = selectedMethod?.method === m.method;
                const badge = getMethodBadge(m.method);

                return (
                  <div
                    key={m.method}
                    onClick={() => m.active && setSelectedMethod(m)}
                    className="glass-card"
                    style={{
                      cursor: m.active ? 'pointer' : 'not-allowed',
                      opacity: m.active ? 1 : 0.45,
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-card)',
                      boxShadow: isSelected
                        ? '0 0 0 2px var(--primary), 0 8px 24px -4px rgba(99, 102, 241, 0.25)'
                        : 'var(--shadow-card)',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              background: 'var(--bg-input)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid var(--border-subtle)'
                            }}
                          >
                            {getMethodIcon(m.method)}
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'block' }}>
                              {m.name}
                            </span>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                color: badge.color,
                                background: badge.bg,
                                padding: '0.1rem 0.35rem',
                                borderRadius: '3px',
                                display: 'inline-block'
                              }}
                            >
                              {badge.text}
                            </span>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 size={18} color="var(--primary)" />}
                      </div>

                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        {m.description}
                      </p>
                    </div>

                    <div
                      style={{
                        marginTop: '1rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.75rem'
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>Min payout:</span>
                      <strong style={{ color: 'var(--color-credit)' }}>
                        {m.currency === 'INR' ? '₹' : '$'}{m.minimumPayout}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Denomination Grid */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.92rem', margin: 0 }}>
                2. Select Denomination ({options.length} available)
              </label>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Standard Exchange: 240 VEs = ₹1.00
              </span>
            </div>

            <div className="payout-options-grid">
              {options.map((opt) => {
                const isSelected = selectedOption?.optionId === opt.optionId;
                const canAfford = userBalance >= opt.requiredAmount;
                const deficit = opt.requiredAmount - userBalance;

                return (
                  <div
                    key={opt.optionId}
                    onClick={() => setSelectedOption(opt)}
                    className="glass-card"
                    style={{
                      cursor: 'pointer',
                      borderColor: isSelected
                        ? 'var(--primary)'
                        : canAfford
                        ? 'var(--border-color)'
                        : 'rgba(239, 68, 68, 0.25)',
                      background: isSelected
                        ? 'rgba(99, 102, 241, 0.12)'
                        : canAfford
                        ? 'var(--bg-card)'
                        : 'rgba(239, 68, 68, 0.03)',
                      boxShadow: isSelected ? '0 0 0 2px var(--primary)' : 'var(--shadow-card)',
                      textAlign: 'center',
                      padding: '1.4rem 1rem',
                      position: 'relative',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          color: 'var(--primary)'
                        }}
                      >
                        <CheckCircle2 size={16} />
                      </div>
                    )}

                    <div
                      className="tabular-nums font-mono"
                      style={{
                        fontSize: '1.85rem',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.1
                      }}
                    >
                      {opt.payoutCurrency === 'INR' ? '₹' : '$'}
                      {opt.payoutValue}
                    </div>

                    <div
                      className="tabular-nums"
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--accent-ve)',
                        marginTop: '0.45rem'
                      }}
                    >
                      {opt.requiredAmount.toLocaleString()} VEs
                    </div>

                    <div style={{ marginTop: '0.85rem' }}>
                      {canAfford ? (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: 'var(--color-credit)',
                            fontWeight: 700,
                            background: 'rgba(16, 185, 129, 0.1)',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '9999px',
                            border: '1px solid rgba(16, 185, 129, 0.25)'
                          }}
                        >
                          ✓ Balance Eligible
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: 'var(--color-debit)',
                            fontWeight: 600,
                            background: 'rgba(239, 68, 68, 0.08)',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '9999px',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                          }}
                        >
                          Need +{deficit.toLocaleString()} VEs
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Recipient Destination Form */}
          {selectedOption && (
            <div className="glass-card" style={{ marginBottom: '2.5rem', padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}
                >
                  {selectedMethod.method === 'UPI' ? <Smartphone size={16} /> : <Mail size={16} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>3. Recipient Destination</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Specify where payout settlement should be routed
                  </span>
                </div>
              </div>

              {selectedMethod.method === 'UPI' ? (
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    UPI Virtual Payment Address (VPA)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. mobile@paytm or yourname@okhdfcbank"
                    value={payoutDetails.upiId}
                    onChange={(e) => setPayoutDetails({ ...payoutDetails, upiId: e.target.value })}
                  />
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.76rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.45rem'
                    }}
                  >
                    <ShieldCheck size={14} color="#10b981" />
                    <span>Funds will route directly to the bank account linked to this UPI address.</span>
                  </div>
                </div>
              ) : (
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    {selectedMethod.method === 'PAYPAL' ? 'PayPal Account Email' : 'Voucher Delivery Email'}
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="recipient@example.com"
                    value={payoutDetails.email}
                    onChange={(e) => setPayoutDetails({ ...payoutDetails, email: e.target.value })}
                  />
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.76rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.45rem'
                    }}
                  >
                    <ShieldCheck size={14} color="#10b981" />
                    <span>
                      {selectedMethod.method === 'PAYPAL'
                        ? 'Funds will be transferred to your registered PayPal email account.'
                        : 'Your digital gift card claim code will be dispatched to this email.'}
                    </span>
                  </div>
                </div>
              )}

              {/* Trust Option A Escrow Card */}
              <div
                style={{
                  background: 'rgba(99, 102, 241, 0.06)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.8rem'
                }}
              >
                <Lock size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span style={{ color: 'var(--text-secondary)' }}>
                  <strong>Option A Escrow Protection:</strong> The required{' '}
                  <strong style={{ color: 'var(--accent-ve)' }}>
                    {selectedOption.requiredAmount.toLocaleString()} VEs
                  </strong>{' '}
                  will be escrowed immediately to avoid double-spend. If any review is rejected, funds
                  are fully refunded to your ledger automatically.
                </span>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={handleProceedToConfirmation}
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 700 }}
              >
                <span>Review & Confirm Request</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: REVIEW & CONFIRMATION */}
      {step === 2 && selectedOption && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399'
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Confirm Payout Request</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.15rem' }}>
                Please verify recipient information before locking funds in escrow
              </p>
            </div>
          </div>

          {/* Breakdown receipt */}
          <div
            style={{
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              marginBottom: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.9rem',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.9rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Payout Channel:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}>
                {getMethodIcon(selectedMethod.method)}
                <span>{selectedMethod.name}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Settlement Value:</span>
              <span className="tabular-nums font-mono" style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--color-credit)' }}>
                {selectedOption.payoutCurrency === 'INR' ? '₹' : '$'}
                {selectedOption.payoutValue}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Exchange Rate:</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>240 VEs = ₹1.00</span>
            </div>

            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.25rem 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Current Wallet Balance:</span>
              <span className="tabular-nums font-mono">{userBalance.toLocaleString()} VEs</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--color-debit)', fontWeight: 600 }}>Escrow Debit Amount:</span>
              <span className="tabular-nums font-mono" style={{ color: 'var(--color-debit)', fontWeight: 800 }}>
                -{selectedOption.requiredAmount.toLocaleString()} VEs
              </span>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Balance After Settlement:</span>
              <span className="tabular-nums font-mono" style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--accent-ve)' }}>
                {(userBalance - selectedOption.requiredAmount).toLocaleString()} VEs
              </span>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Destination Recipient:</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {payoutDetails.upiId || payoutDetails.email}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                paddingTop: '0.25rem'
              }}
            >
              <span>Idempotency Key:</span>
              <span className="font-mono">{idempotencyKey}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStep(1)}
              style={{ flex: 1, padding: '0.75rem' }}
              disabled={submitting}
            >
              Back to Options
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleConfirmAndWithdraw}
              style={{ flex: 2, padding: '0.75rem', fontWeight: 700 }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <RefreshCw size={16} className="spin" />
                  <span>Authorizing Settlement...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Lock Escrow</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SUCCESS RECEIPT */}
      {step === 3 && successData && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: '0 0 24px rgba(16, 185, 129, 0.3)'
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.45rem', letterSpacing: '-0.02em' }}>
            Payout Request Submitted!
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 2rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Your withdrawal has been registered on the server-authoritative ledger. Funds have been safely escrowed
            under status <strong style={{ color: '#fbbf24' }}>PENDING</strong>.
          </p>

          <div
            style={{
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              maxWidth: '480px',
              margin: '0 auto 2.5rem',
              textAlign: 'left',
              fontSize: '0.88rem',
              border: '1px solid var(--border-subtle)',
              position: 'relative'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.85rem'
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Withdrawal Reference ID:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {successData.data?.withdrawalId}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyText(successData.data?.withdrawalId)}
                  title="Copy ID"
                  style={{
                    padding: '0.2rem',
                    color: copiedId ? '#34d399' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {copiedId ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Method / Destination:</span>
              <span style={{ fontWeight: 600 }}>
                {selectedMethod.name} ({payoutDetails.upiId || payoutDetails.email})
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Amount Redeemable:</span>
              <span className="tabular-nums font-mono" style={{ color: 'var(--color-credit)', fontWeight: 800 }}>
                {selectedOption.payoutCurrency === 'INR' ? '₹' : '$'}
                {selectedOption.payoutValue}
              </span>
            </div>

            <div
              style={{
                borderTop: '1px dashed var(--border-color)',
                paddingTop: '0.85rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Updated Wallet Balance:</span>
              <span className="tabular-nums font-mono" style={{ color: 'var(--accent-ve)', fontWeight: 800 }}>
                {Number(successData.meta?.remainingBalance || 0).toLocaleString()} VEs
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleResetForAnother}
              style={{ padding: '0.75rem 1.5rem' }}
            >
              Redeem Another Reward
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={onBackToWallet}
              style={{ padding: '0.75rem 2rem', fontWeight: 700 }}
            >
              Return to Wallet & View Ledger
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
