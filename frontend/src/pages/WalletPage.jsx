import React, { useState, useEffect } from 'react';
import { walletApi, withdrawalApi } from '../api/client';
import { CurrencyCards } from '../components/CurrencyCards';
import { TransactionLedger } from '../components/TransactionLedger';
import { RefreshCw, ArrowUpRight, Clock, AlertCircle } from 'lucide-react';

export const WalletPage = ({ onNavigateToPayout }) => {
  const [wallet, setWallet] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

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
    } catch (err) {
      setError(err.message || 'Failed to load wallet data from server.');
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
        <RefreshCw size={32} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', fontWeight: 600 }}>Loading verified wallet balances from backend...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Title & Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>VELoop Rewards Wallet</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Authoritative Server Balances & Cryptographic Multi-Currency Ledger
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn-secondary"
            onClick={() => fetchWalletData(pagination.page, true)}
            disabled={refreshing}
            title="Refresh verified balances"
          >
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Syncing...' : 'Refresh'}
          </button>
          <button className="btn-primary" onClick={onNavigateToPayout}>
            Withdraw / Redeem VEs <ArrowUpRight size={18} />
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-banner error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 5-Currency Cards & Metrics */}
      <CurrencyCards
        wallet={wallet}
        metrics={metrics}
        onRedeemClick={onNavigateToPayout}
      />

      {/* Recent Withdrawals Tracking */}
      {withdrawals.length > 0 && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#f59e0b" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Redemptions & Payout Requests</h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status tracking</span>
          </div>

          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Withdrawal ID</th>
                  <th>Method</th>
                  <th>Payout Value</th>
                  <th>VEs Deducted</th>
                  <th>Status</th>
                  <th>Recipient Info</th>
                  <th>Requested At</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.withdrawalId}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{w.withdrawalId}</td>
                    <td style={{ fontWeight: 600 }}>{w.method}</td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>
                      {w.payoutCurrency === 'INR' ? '₹' : '$'}
                      {w.payoutAmount}
                    </td>
                    <td style={{ color: '#c4b5fd', fontWeight: 600 }}>
                      {Number(w.currencyAmount).toLocaleString()} VEs
                    </td>
                    <td>
                      <span className={`badge-status ${w.status.toLowerCase()}`}>
                        {w.status}
                      </span>
                      {w.rejectionReason && (
                        <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px' }}>
                          Reason: {w.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {w.payoutDetails?.maskedUpiId || w.payoutDetails?.upiId || w.payoutDetails?.email || 'N/A'}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(w.requestedAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Complete Immutable Transaction Ledger */}
      <TransactionLedger
        transactions={transactions}
        pagination={pagination}
        onPageChange={handlePageChange}
        loading={false}
      />
    </div>
  );
};
