import React, { useState, useEffect } from 'react';
import { payoutApi, withdrawalApi, walletApi } from '../api/client';
import { ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, CreditCard, Mail, ArrowRight } from 'lucide-react';

export const PayoutPage = ({ onBackToWallet }) => {
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [payoutDetails, setPayoutDetails] = useState({ upiId: '', email: '' });
  const [userBalance, setUserBalance] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Select Method & Option, 2: Enter Details & Confirm, 3: Success
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState(null);
  const [idempotencyKey, setIdempotencyKey] = useState(`idem_${Date.now()}_${Math.random().toString(36).substring(7)}`);

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
          // Default to first active method (usually UPI)
          const firstActive = methodsRes.data.find((m) => m.active);
          if (firstActive) {
            setSelectedMethod(firstActive);
          }
        }
        if (walletRes.success) {
          setUserBalance(walletRes.data.ves || 0);
        }
      } catch (err) {
        setError(err.message || 'Failed to initialize payout catalog');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // When selectedMethod changes, fetch database-configured options for that method
  useEffect(() => {
    if (!selectedMethod) return;

    const loadOptions = async () => {
      try {
        setError(null);
        setSelectedOption(null);
        const res = await payoutApi.getOptionsByMethod(selectedMethod.method);
        if (res.success) {
          setOptions(res.data);
          // Auto select first option if available
          if (res.data.length > 0) {
            setSelectedOption(res.data[0]);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch options for method');
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
      setError(`Insufficient VEs balance. You need ${selectedOption.requiredAmount.toLocaleString()} VEs for this payout, but have ${userBalance.toLocaleString()} VEs.`);
      return;
    }

    if (selectedMethod.method === 'UPI' && !payoutDetails.upiId.trim()) {
      setError('Please enter a valid UPI ID (e.g. username@bank).');
      return;
    }

    if (['PAYPAL', 'AMAZON_GIFT_CARD', 'GOOGLE_PLAY_GIFT_CARD'].includes(selectedMethod.method) && !payoutDetails.email.trim()) {
      setError('Please enter a valid delivery email address.');
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
      setError(err.message || 'Withdrawal failed. Please check your balance or payout details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
        Loading backend payout methods and live rates...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          className="btn-secondary"
          onClick={onBackToWallet}
          style={{ padding: '0.5rem 0.85rem' }}
        >
          <ArrowLeft size={16} /> Back to Wallet
        </button>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Redeem Rewards</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Instant platform payout with atomic balance debit & ledger verification
          </p>
        </div>
      </div>

      {error && (
        <div className="alert-banner error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: METHOD & DENOMINATION SELECTION */}
      {step === 1 && (
        <div>
          {/* Method Tabs */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontSize: '0.95rem', fontWeight: 600 }}>
              1. Select Payout Method
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
                      opacity: m.active ? 1 : 0.5,
                      borderColor: isSelected ? '#8b5cf6' : 'var(--border-color)',
                      background: isSelected ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-card)',
                      boxShadow: isSelected ? '0 0 20px rgba(139, 92, 246, 0.2)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>{m.name}</span>
                      {isSelected && <CheckCircle2 size={18} color="#8b5cf6" />}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                      {m.description}
                    </p>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                      Min payout: {m.currency === 'INR' ? '₹' : '$'}{m.minimumPayout}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Options Grid */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
                2. Select Denomination ({options.length} options from backend)
              </label>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Your Balance: <strong style={{ color: '#8b5cf6' }}>{userBalance.toLocaleString()} VEs</strong>
              </span>
            </div>

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
                      borderColor: isSelected ? '#8b5cf6' : canAfford ? 'var(--border-color)' : 'rgba(239, 68, 68, 0.3)',
                      background: isSelected
                        ? 'rgba(139, 92, 246, 0.18)'
                        : canAfford
                        ? 'var(--bg-card)'
                        : 'rgba(239, 68, 68, 0.04)',
                      textAlign: 'center',
                      padding: '1.25rem 1rem'
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
                      {opt.payoutCurrency === 'INR' ? '₹' : '$'}
                      {opt.payoutValue}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c4b5fd', marginTop: '0.35rem' }}>
                      {opt.requiredAmount.toLocaleString()} VEs
                    </div>
                    <div style={{ marginTop: '0.75rem' }}>
                      {canAfford ? (
                        <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                          ✓ Eligible
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 600 }}>
                          Need +{(opt.requiredAmount - userBalance).toLocaleString()} VEs
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Enter Details */}
          {selectedOption && (
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                3. Enter Payout Details
              </h3>

              {selectedMethod.method === 'UPI' ? (
                <div className="form-group">
                  <label className="form-label">UPI ID / Virtual Payment Address (VPA)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="yourname@okhdfcbank or 9876543210@paytm"
                    value={payoutDetails.upiId}
                    onChange={(e) => setPayoutDetails({ ...payoutDetails, upiId: e.target.value })}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Make sure your UPI ID is linked to your active bank account.
                  </span>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">
                    {selectedMethod.method === 'PAYPAL' ? 'PayPal Email' : 'Delivery Email Address'}
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="user@example.com"
                    value={payoutDetails.email}
                    onChange={(e) => setPayoutDetails({ ...payoutDetails, email: e.target.value })}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    {selectedMethod.method === 'PAYPAL'
                      ? 'Funds will be transferred directly to this PayPal account.'
                      : 'Digital voucher code will be sent to this email address.'}
                  </span>
                </div>
              )}

              <button
                type="button"
                className="btn-primary"
                onClick={handleProceedToConfirmation}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                Proceed to Review & Confirm <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: REVIEW & CONFIRMATION MODAL */}
      {step === 2 && selectedOption && (
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
            <ShieldCheck size={22} color="#10b981" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Confirm Payout Request</h2>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Please review the financial transaction details below. Upon confirmation, your VEs balance will be
            immediately deducted according to Option A financial strategy and a pending withdrawal recorded.
          </p>

          <div
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Payout Method:</span>
              <span style={{ fontWeight: 600 }}>{selectedMethod.name}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Denomination / Amount:</span>
              <span style={{ fontWeight: 700, color: '#10b981' }}>
                {selectedOption.payoutCurrency === 'INR' ? '₹' : '$'}
                {selectedOption.payoutValue}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Current Balance:</span>
              <span>{userBalance.toLocaleString()} VEs</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#ef4444', fontWeight: 600 }}>VEs Required (Debited):</span>
              <span style={{ color: '#ef4444', fontWeight: 700 }}>
                -{selectedOption.requiredAmount.toLocaleString()} VEs
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700 }}>Remaining Balance After Payout:</span>
              <span style={{ fontWeight: 800, color: '#8b5cf6' }}>
                {(userBalance - selectedOption.requiredAmount).toLocaleString()} VEs
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Recipient Destination:</span>
              <span style={{ fontWeight: 600, color: '#6ee7b7' }}>
                {payoutDetails.upiId || payoutDetails.email}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Idempotency Key:</span>
              <span style={{ fontFamily: 'monospace' }}>{idempotencyKey}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStep(1)}
              style={{ flex: 1 }}
              disabled={submitting}
            >
              Modify Details
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleConfirmAndWithdraw}
              style={{ flex: 2 }}
              disabled={submitting}
            >
              {submitting ? 'Processing Transaction...' : 'Confirm & Submit Withdrawal'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SUCCESS CONFIRMATION */}
      {step === 3 && successData && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Withdrawal Request Submitted!
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
            Your request has been successfully registered on the immutable ledger. Status is currently{' '}
            <strong style={{ color: '#f59e0b' }}>PENDING</strong>.
          </p>

          <div
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '0.75rem',
              padding: '1rem',
              maxWidth: '420px',
              margin: '0 auto 2rem',
              textAlign: 'left',
              fontSize: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Withdrawal ID:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                {successData.data?.withdrawalId}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Ledger Debit Ref:</span>
              <span style={{ fontFamily: 'monospace' }}>
                {successData.meta?.transactionId}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>New VEs Balance:</span>
              <span style={{ color: '#8b5cf6', fontWeight: 700 }}>
                {Number(successData.meta?.remainingBalance || 0).toLocaleString()} VEs
              </span>
            </div>
          </div>

          <button className="btn-primary" onClick={onBackToWallet} style={{ padding: '0.75rem 2rem' }}>
            Return to Wallet & View Ledger
          </button>
        </div>
      )}
    </div>
  );
};
