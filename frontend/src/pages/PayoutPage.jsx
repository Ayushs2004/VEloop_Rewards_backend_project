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
  Coins
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
  const [copiedReceiptId, setCopiedReceiptId] = useState(false);
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
        `Insufficient VEs balance. This payout requires ${selectedOption.requiredAmount.toLocaleString()} VEs, but your balance is ${userBalance.toLocaleString()} VEs.`
      );
      return;
    }

    if (selectedMethod.method === 'UPI' && !payoutDetails.upiId.trim()) {
      setError('Please enter a valid UPI ID / Virtual Payment Address (e.g. name@bank).');
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

  const getMethodIcon = (methodCode) => {
    switch (methodCode) {
      case 'UPI':
        return <Smartphone size={18} color="#38bdf8" />;
      case 'PAYPAL':
        return <CreditCard size={18} color="#818cf8" />;
      case 'AMAZON_GIFT_CARD':
      case 'GOOGLE_PLAY_GIFT_CARD':
        return <Gift size={18} color="#fbbf24" />;
      default:
        return <CreditCard size={18} color="#a78bfa" />;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem', color: 'var(--text-secondary)' }}>
        <p style={{ fontWeight: 600 }}>Loading verified payout channels...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }} className="fade-in">
      {/* Top Breadcrumb & Return Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
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
            <h1 style={{ fontSize: '1.65rem', fontWeight: 700 }}>Redeem Rewards</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.15rem' }}>
              Convert verified VEs balance into cash or digital gift cards
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--bg-secondary)',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            border: '1px solid var(--border-color)',
            fontSize: '0.78rem'
          }}
        >
          <span style={{ fontWeight: step === 1 ? 700 : 500, color: step === 1 ? '#818cf8' : 'var(--text-muted)' }}>
            1. Select
          </span>
          <span style={{ color: 'var(--text-muted)' }}>›</span>
          <span style={{ fontWeight: step === 2 ? 700 : 500, color: step === 2 ? '#818cf8' : 'var(--text-muted)' }}>
            2. Review
          </span>
          <span style={{ color: 'var(--text-muted)' }}>›</span>
          <span style={{ fontWeight: step === 3 ? 700 : 500, color: step === 3 ? '#34d399' : 'var(--text-muted)' }}>
            3. Receipt
          </span>
        </div>
      </div>

      {error && (
        <div className="alert-banner error">
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: METHOD & DENOMINATION SELECTION */}
      {step === 1 && (
        <div>
          {/* Method Selection */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem', margin: 0 }}>
                1. Select Payout Channel
              </label>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Available Balance:{' '}
                <strong className="tabular-nums" style={{ color: '#c4b5fd' }}>
                  {userBalance.toLocaleString()} VEs
                </strong>
              </span>
            </div>

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
                      opacity: m.active ? 1 : 0.45,
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)',
                      boxShadow: isSelected ? '0 0 0 1px var(--primary), var(--shadow-card)' : 'var(--shadow-card)',
                      padding: '1.25rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {getMethodIcon(m.method)}
                        <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{m.name}</span>
                      </div>
                      {isSelected && <CheckCircle2 size={16} color="#818cf8" />}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.45rem', lineHeight: 1.4 }}>
                      {m.description}
                    </p>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
                      Min payout: {m.currency === 'INR' ? '₹' : '$'}{m.minimumPayout}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Denominations Grid */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.65rem' }}>
              2. Select Denomination ({options.length} options)
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
                      borderColor: isSelected
                        ? 'var(--primary)'
                        : canAfford
                        ? 'var(--border-color)'
                        : 'rgba(239, 68, 68, 0.25)',
                      background: isSelected
                        ? 'rgba(99, 102, 241, 0.14)'
                        : canAfford
                        ? 'var(--bg-card)'
                        : 'rgba(239, 68, 68, 0.04)',
                      boxShadow: isSelected ? '0 0 0 1px var(--primary)' : 'none',
                      textAlign: 'center',
                      padding: '1.25rem 1rem'
                    }}
                  >
                    <div
                      className="tabular-nums"
                      style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}
                    >
                      {opt.payoutCurrency === 'INR' ? '₹' : '$'}
                      {opt.payoutValue}
                    </div>
                    <div
                      className="tabular-nums"
                      style={{ fontSize: '0.82rem', fontWeight: 600, color: '#c4b5fd', marginTop: '0.35rem' }}
                    >
                      {opt.requiredAmount.toLocaleString()} VEs
                    </div>
                    <div style={{ marginTop: '0.75rem' }}>
                      {canAfford ? (
                        <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>
                          ✓ Eligible
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 600 }}>
                          Need +{(opt.requiredAmount - userBalance).toLocaleString()} VEs
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recipient Details & Submit */}
          {selectedOption && (
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>
                3. Recipient Destination
              </h3>

              {selectedMethod.method === 'UPI' ? (
                <div className="form-group">
                  <label className="form-label">UPI ID / Virtual Payment Address (VPA)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. mobile@paytm or username@okhdfcbank"
                    value={payoutDetails.upiId}
                    onChange={(e) => setPayoutDetails({ ...payoutDetails, upiId: e.target.value })}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'block' }}>
                    Payout will be routed directly to your bank account linked to this UPI VPA.
                  </span>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">
                    {selectedMethod.method === 'PAYPAL' ? 'PayPal Email Address' : 'Voucher Delivery Email'}
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="recipient@example.com"
                    value={payoutDetails.email}
                    onChange={(e) => setPayoutDetails({ ...payoutDetails, email: e.target.value })}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'block' }}>
                    {selectedMethod.method === 'PAYPAL'
                      ? 'Funds will be transferred to your registered PayPal email account.'
                      : 'Digital voucher claim code will be dispatched to this email.'}
                  </span>
                </div>
              )}

              <button
                type="button"
                className="btn-primary"
                onClick={handleProceedToConfirmation}
                style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
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
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} color="#34d399" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Review Payout Details</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Verify your payout recipient information before confirming the debit
              </p>
            </div>
          </div>

          {/* Breakdown receipt */}
          <div
            style={{
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.88rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Method:</span>
              <span style={{ fontWeight: 600 }}>{selectedMethod.name}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Payout Value:</span>
              <span className="tabular-nums" style={{ fontWeight: 700, color: '#34d399' }}>
                {selectedOption.payoutCurrency === 'INR' ? '₹' : '$'}
                {selectedOption.payoutValue}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Current Balance:</span>
              <span className="tabular-nums">{userBalance.toLocaleString()} VEs</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#f87171', fontWeight: 600 }}>Balance to Debit:</span>
              <span className="tabular-nums" style={{ color: '#f87171', fontWeight: 700 }}>
                -{selectedOption.requiredAmount.toLocaleString()} VEs
              </span>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.65rem',
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span style={{ fontWeight: 600 }}>Balance After Payout:</span>
              <span className="tabular-nums" style={{ fontWeight: 800, color: '#c4b5fd' }}>
                {(userBalance - selectedOption.requiredAmount).toLocaleString()} VEs
              </span>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.65rem',
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Destination Recipient:</span>
              <span style={{ fontWeight: 600, color: '#6ee7b7' }}>
                {payoutDetails.upiId || payoutDetails.email}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Transaction Ref (Idempotency):</span>
              <span className="font-mono">{idempotencyKey}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStep(1)}
              style={{ flex: 1 }}
              disabled={submitting}
            >
              Back
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleConfirmAndWithdraw}
              style={{ flex: 2 }}
              disabled={submitting}
            >
              {submitting ? 'Processing Transaction...' : 'Confirm & Submit Payout'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SUCCESS RECEIPT */}
      {step === 3 && successData && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}
          >
            <CheckCircle2 size={32} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            Payout Request Submitted
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem', fontSize: '0.88rem' }}>
            Your withdrawal has been registered on the immutable ledger. Current status is{' '}
            <strong style={{ color: '#fbbf24' }}>PENDING</strong> review.
          </p>

          <div
            style={{
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              maxWidth: '440px',
              margin: '0 auto 2rem',
              textAlign: 'left',
              fontSize: '0.85rem',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Withdrawal ID:</span>
              <span className="font-mono" style={{ fontWeight: 600 }}>
                {successData.data?.withdrawalId}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Ledger Debit Ref:</span>
              <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                {successData.meta?.transactionId}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Updated VEs Balance:</span>
              <span className="tabular-nums" style={{ color: '#c4b5fd', fontWeight: 700 }}>
                {Number(successData.meta?.remainingBalance || 0).toLocaleString()} VEs
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={onBackToWallet}
            style={{ padding: '0.75rem 2rem' }}
          >
            Return to Wallet & View Ledger
          </button>
        </div>
      )}
    </div>
  );
};
