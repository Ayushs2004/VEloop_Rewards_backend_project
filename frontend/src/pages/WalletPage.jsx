import React, { useState, useEffect } from 'react';
import { walletApi, withdrawalApi } from '../api/client';
import { CurrencyCards } from '../components/CurrencyCards';
import { EcosystemRewardsHub } from '../components/EcosystemRewardsHub';
import { TransactionLedger } from '../components/TransactionLedger';
import { RefreshCw, ArrowUpRight, Clock, AlertCircle, Copy, Check, ShieldCheck, Zap, Lock } from 'lucide-react';

export const WalletPage = ({ onNavigateToPayout }) => {
  const [wallet, setWallet] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [copiedWdId, setCopiedWdId] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);

  const fetchWalletData = async (page = 1, showRefreshSpinner = false) => {
    if (showRefreshSpinner) setRefreshing(true);
    setError(null);

    try {
      const [walletRes, summaryRes, txRes, withdrawalsRes] = await Promise.all([
        walletApi.getWallet(),
        walletApi.getSummary(),
        walletApi.getTransactions(`page=${page}&limit=10`),
        withdrawalApi.getWithdrawals('limit=5')
      ]);

      if (walletRes.success) setWallet(walletRes.data);
      if (summaryRes.success) setMetrics(summaryRes.data.metrics);
      if (txRes.success) {
        setTransactions(txRes.data);
        if (txRes.meta) setPagination(txRes.meta);
      }
      if (withdrawalsRes.success) setWithdrawals(withdrawalsRes.data);
      setLastSynced(new Date());
    } catch (err) {
      setError(err.message || 'Failed to sync wallet data from server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handlePageChange = (newPage) => {
    fetchWalletData(newPage);
  };

  const handleCopyWd = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedWdId(id);
    setTimeout(() => setCopiedWdId(null), 1800);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem', color: 'var(--text-secondary)' }}>
        <RefreshCw size={28} className="spin" style={{ color: '#818cf8', margin: '0 auto 1rem' }} />
        <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Syncing balances with server...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 900, fontFamily: 'Poppins, sans-serif' }}>
            <span style={{ color: '#ffc107' }}>VE</span>
            <span style={{ color: 'var(--text-primary)' }}>Loop</span> Rewards Wallet
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Multi-currency balances, connected earning hubs, and real-time transaction ledger
            {lastSynced && (
              <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                · Updated {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => fetchWalletData(pagination.page, true)}
            disabled={refreshing}
            title="Sync balances with server"
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onNavigateToPayout}
            style={{
              fontWeight: 800,
              background: 'linear-gradient(145deg, #3d5afe, #5c7cff)',
              boxShadow: '0 6px 18px rgba(61, 90, 254, 0.45)'
            }}
          >
            <span>Redeem Payout</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-banner error">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* 5-Currency Cards & Financial Metrics */}
      <CurrencyCards
        wallet={wallet}
        metrics={metrics}
        onRedeemClick={onNavigateToPayout}
      />

      {/* Connected Ecosystem Rewards Hub */}
      <EcosystemRewardsHub
        wallet={wallet}
        onNavigateToPayout={onNavigateToPayout}
      />

      {/* Trust & Security Assurance Seals */}
      <div
        className="glass-card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          padding: '1.25rem 1.5rem',
          marginBottom: '2.5rem',
          background: 'var(--bg-card)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={18} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>100% Server-Authoritative</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Anti-Tamper MongoDB Ledger</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="var(--color-credit)" />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Option A Instant Escrow</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Atomic balance debit & safe refund</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={18} color="var(--accent-spin)" />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Idempotent Transactions</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Zero double-spend protection</div>
          </div>
        </div>
      </div>

      {/* Recent Redemptions Tracking */}
      {withdrawals && withdrawals.length > 0 && (
        <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={16} color="#fbbf24" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Redemptions</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Latest withdrawal requests and payout status</p>
              </div>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Showing last {withdrawals.length} requests
            </span>
          </div>

          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Method</th>
                  <th>Payout Value</th>
                  <th>VEs Deducted</th>
                  <th>Status</th>
                  <th>Recipient Destination</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => {
                  const isCopied = copiedWdId === w.withdrawalId;
                  return (
                    <tr key={w.withdrawalId}>
                      <td>
                        <button
                          type="button"
                          className="copy-pill"
                          onClick={() => handleCopyWd(w.withdrawalId)}
                          title="Click to copy Request ID"
                        >
                          <span>{w.withdrawalId.substring(0, 14)}...</span>
                          {isCopied ? <Check size={11} color="#34d399" /> : <Copy size={11} />}
                        </button>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{w.method}</td>
                      <td className="tabular-nums" style={{ fontWeight: 700, color: 'var(--color-credit)' }}>
                        {w.payoutCurrency === 'INR' ? '₹' : '$'}
                        {w.payoutAmount}
                      </td>
                      <td className="tabular-nums" style={{ color: 'var(--accent-ve)', fontWeight: 600 }}>
                        {Number(w.currencyAmount).toLocaleString()} VEs
                      </td>
                      <td>
                        <span className={`badge-status ${w.status.toLowerCase()}`}>
                          {w.status}
                        </span>
                        {w.rejectionReason && (
                          <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '4px' }}>
                            {w.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {w.payoutDetails?.maskedUpiId || w.payoutDetails?.upiId || w.payoutDetails?.email || 'N/A'}
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(w.requestedAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Ledger Table */}
      <TransactionLedger
        transactions={transactions}
        pagination={pagination}
        onPageChange={handlePageChange}
        loading={false}
      />
    </div>
  );
};
