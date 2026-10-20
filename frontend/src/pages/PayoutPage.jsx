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
  Coins,
  RefreshCw
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
  const [step, setStep] = useState(1);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(
    `idem_${Date.now()}_${Math.random().toString(36).substring(7)}`
  );

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
          if (firstActive) setSelectedMethod(firstActive);
        }
        if (walletRes.success) setUserBalance(walletRes.data.ves || 0);
      } catch (err) {
        setError(err.message || 'Failed to load payout methods');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedMethod) return;
    const loadOptions = async () => {
      try {
        setError(null);
        setSelectedOption(null);
        const res = await payoutApi.getOptionsByMethod(selectedMethod.method);
        if (res.success) {
          setOptions(res.data);
          if (res.data.length > 0) setSelectedOption(res.data[0]);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch options');
      }
    };
    loadOptions();
  }, [selectedMethod]);

  const handleProceed = (e) => {
    e.preventDefault();
    setError(null);
    if (!selectedOption) { setError('Select a payout denomination.'); return; }
    if (userBalance < selectedOption.requiredAmount) {
      setError(`Insufficient VEs. Need ${selectedOption.requiredAmount.toLocaleString()}, have ${userBalance.toLocaleString()}.`);
      return;
    }
    if (selectedMethod.method === 'UPI' && !payoutDetails.upiId.trim()) {
      setError('Enter a valid UPI ID.'); return;
    }
    if (['PAYPAL', 'AMAZON_GIFT_CARD', 'GOOGLE_PLAY_GIFT_CARD'].includes(selectedMethod.method) && !payoutDetails.email.trim()) {
      setError('Enter a valid email address.'); return;
    }
    setStep(2);
  };

  const handleConfirm = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        method: selectedMethod.method,
        optionId: selectedOption.optionId,
        payoutDetails: selectedMethod.method === 'UPI'
          ? { upiId: payoutDetails.upiId.trim() }
          : { email: payoutDetails.email.trim().toLowerCase() }
      };
      const res = await withdrawalApi.create(payload, idempotencyKey);
      if (res.success) { setSuccessData(res); setStep(3); }
    } catch (err) {
      setError(err.message || 'Payout request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleReset = () => {
    setStep(1);
    setSuccessData(null);
    setIdempotencyKey(`idem_${Date.now()}_${Math.random().toString(36).substring(7)}`);
    walletApi.getWallet().then((res) => {
      if (res.success) setUserBalance(res.data.ves || 0);
    });
  };

  const getMethodIcon = (code) => {
    switch (code) {
      case 'UPI': return <Smartphone size={16} style={{ color: 'var(--accent-sve)' }} />;
      case 'PAYPAL': return <CreditCard size={16} style={{ color: 'var(--primary)' }} />;
      case 'AMAZON_GIFT_CARD':
      case 'GOOGLE_PLAY_GIFT_CARD': return <Gift size={16} style={{ color: 'var(--accent-ve)' }} />;
      default: return <Coins size={16} style={{ color: 'var(--primary)' }} />;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-secondary)' }}>
        <RefreshCw size={24} className="spin" style={{ color: 'var(--primary)', margin: '0 auto 0.75rem' }} />
        <p style={{ fontWeight: 500, fontSize: '0.88rem' }}>Loading payout options...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }} className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button type="button" className="btn-secondary" onClick={onBackToWallet} style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}>
            <ArrowLeft size={13} />
            <span>Back</span>
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Redeem Rewards</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Convert VEs into cash or gift cards</p>
          </div>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.7rem', borderRadius: '9999px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Balance:</span>
          <strong className="tabular-nums font-mono" style={{ color: 'var(--accent-ve)' }}>
            {userBalance.toLocaleString()} VEs
          </strong>
        </div>
      </div>

      {/* Stepper */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '0.75rem 1rem' }}>
        {[
          { num: 1, label: 'Select' },
          { num: 2, label: 'Review' },
          { num: 3, label: 'Done' }
        ].map((s, i) => (
          <React.Fragment key={s.num}>
            {i > 0 && <div style={{ flex: '0 0 24px', height: '2px', background: step >= s.num ? 'var(--primary)' : 'var(--border-subtle)' }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: step >= s.num ? 'var(--primary)' : 'var(--bg-input)',
                color: step >= s.num ? '#fff' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontWeight: 700
              }}>
                {step > s.num ? <Check size={12} /> : s.num}
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: step === s.num ? 600 : 400, color: step >= s.num ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {s.label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div className="alert-banner error" style={{ marginBottom: '1.25rem' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <div>
          {/* Methods */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.5rem' }}>
              1. Payout Channel
            </label>
            <div className="payout-methods-grid">
              {methods.map((m) => {
                const isSelected = selectedMethod?.method === m.method;
                return (
                  <div
                    key={m.method}
                    onClick={() => m.active && setSelectedMethod(m)}
                    className="glass-card"
                    style={{
                      cursor: m.active ? 'pointer' : 'not-allowed',
                      opacity: m.active ? 1 : 0.4,
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                      background: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                      padding: '1rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {getMethodIcon(m.method)}
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.name}</span>
                      </div>
                      {isSelected && <CheckCircle2 size={16} color="var(--primary)" />}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{m.description}</p>
                    <div style={{ marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Min:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{m.currency === 'INR' ? '₹' : '$'}{m.minimumPayout}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Denominations */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.5rem' }}>
              2. Amount ({options.length} options)
            </label>
            <div className="payout-options-grid">
              {options.map((opt) => {
                const isSelected = selectedOption?.optionId === opt.optionId;
                const canAfford = userBalance >= opt.requiredAmount;
                return (
                  <div
                    key={opt.optionId}
                    onClick={() => setSelectedOption(opt)}
                    className="glass-card"
                    style={{
                      cursor: 'pointer',
                      borderColor: isSelected ? 'var(--primary)' : canAfford ? 'var(--border-color)' : 'rgba(239, 68, 68, 0.2)',
                      background: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                      textAlign: 'center',
                      padding: '1rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isSelected && (
                      <div style={{ position: 'absolute', top: '6px', right: '6px', color: 'var(--primary)' }}>
                        <CheckCircle2 size={14} />
                      </div>
                    )}
                    <div className="tabular-nums font-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {opt.payoutCurrency === 'INR' ? '₹' : '$'}{opt.payoutValue}
                    </div>
                    <div className="tabular-nums" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-ve)', marginTop: '0.3rem' }}>
                      {opt.requiredAmount.toLocaleString()} VEs
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      {canAfford ? (
                        <span style={{ fontSize: '0.68rem', color: 'var(--color-credit)', fontWeight: 600 }}>✓ Eligible</span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', color: 'var(--color-debit)', fontWeight: 500 }}>
                          Need +{(opt.requiredAmount - userBalance).toLocaleString()} VEs
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Destination */}
          {selectedOption && (
            <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {selectedMethod.method === 'UPI' ? <Smartphone size={15} /> : <Mail size={15} />}
                3. Destination
              </h3>

              {selectedMethod.method === 'UPI' ? (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">UPI ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="yourname@oksbi"
                    value={payoutDetails.upiId}
                    onChange={(e) => setPayoutDetails({ ...payoutDetails, upiId: e.target.value })}
                  />
                </div>
              ) : (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">
                    {selectedMethod.method === 'PAYPAL' ? 'PayPal Email' : 'Delivery Email'}
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="email@example.com"
                    value={payoutDetails.email}
                    onChange={(e) => setPayoutDetails({ ...payoutDetails, email: e.target.value })}
                  />
                </div>
              )}

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={13} style={{ color: 'var(--color-credit)' }} />
                <span>{selectedOption.requiredAmount.toLocaleString()} VEs will be locked in escrow. Refunded if rejected.</span>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={handleProceed}
                style={{ width: '100%', padding: '0.65rem' }}
              >
                <span>Review & Confirm</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && selectedOption && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} style={{ color: 'var(--color-credit)' }} />
            Confirm Payout
          </h2>

          <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '1.15rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Channel:</span>
              <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {getMethodIcon(selectedMethod.method)} {selectedMethod.name}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Amount:</span>
              <span className="tabular-nums font-mono" style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-credit)' }}>
                {selectedOption.payoutCurrency === 'INR' ? '₹' : '$'}{selectedOption.payoutValue}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Rate:</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>240 VEs = ₹1</span>
            </div>
            <div style={{ height: '1px', background: 'var(--border-subtle)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Balance:</span>
              <span className="tabular-nums font-mono">{userBalance.toLocaleString()} VEs</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-debit)' }}>Debit:</span>
              <span className="tabular-nums font-mono" style={{ color: 'var(--color-debit)', fontWeight: 700 }}>
                -{selectedOption.requiredAmount.toLocaleString()} VEs
              </span>
            </div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>After:</span>
              <span className="tabular-nums font-mono" style={{ fontWeight: 700, color: 'var(--accent-ve)' }}>
                {(userBalance - selectedOption.requiredAmount).toLocaleString()} VEs
              </span>
            </div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>To:</span>
              <span style={{ fontWeight: 600 }}>{payoutDetails.upiId || payoutDetails.email}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }} disabled={submitting}>
              Back
            </button>
            <button type="button" className="btn-primary" onClick={handleConfirm} style={{ flex: 2, fontWeight: 600 }} disabled={submitting}>
              {submitting ? (
                <>
                  <RefreshCw size={14} className="spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Confirm Payout</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && successData && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-credit)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
          }}>
            <CheckCircle2 size={28} />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.3rem' }}>Request Submitted!</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.85rem' }}>
            Your payout is pending admin review.
          </p>

          <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '1rem', maxWidth: '400px', margin: '0 auto 1.5rem', textAlign: 'left', fontSize: '0.82rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Reference ID:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span className="font-mono" style={{ fontWeight: 600, fontSize: '0.78rem' }}>{successData.data?.withdrawalId}</span>
                <button type="button" onClick={() => handleCopyText(successData.data?.withdrawalId)} style={{ padding: '2px', color: copiedId ? 'var(--color-credit)' : 'var(--text-muted)', cursor: 'pointer' }}>
                  {copiedId ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Method:</span>
              <span style={{ fontWeight: 600 }}>{selectedMethod.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Amount:</span>
              <span className="tabular-nums font-mono" style={{ color: 'var(--color-credit)', fontWeight: 700 }}>
                {selectedOption.payoutCurrency === 'INR' ? '₹' : '$'}{selectedOption.payoutValue}
              </span>
            </div>
            <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Remaining:</span>
              <span className="tabular-nums font-mono" style={{ color: 'var(--accent-ve)', fontWeight: 700 }}>
                {Number(successData.meta?.remainingBalance || 0).toLocaleString()} VEs
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn-secondary" onClick={handleReset}>Redeem Another</button>
            <button type="button" className="btn-primary" onClick={onBackToWallet} style={{ fontWeight: 600 }}>Back to Wallet</button>
          </div>
        </div>
      )}
    </div>
  );
};
