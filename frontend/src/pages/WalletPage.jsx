import React, { useState, useEffect } from 'react';
import { walletApi, withdrawalApi } from '../api/client';
import { CurrencyCards } from '../components/CurrencyCards';
import { EcosystemRewardsHub } from '../components/EcosystemRewardsHub';
import { TransactionLedger } from '../components/TransactionLedger';
import { RefreshCw, ArrowUpRight, Clock, AlertCircle, Copy, Check } from 'lucide-react';

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
      setError(err.message || 'Failed to sync wallet data.');
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
      <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-secondary)' }}>
        <RefreshCw size={24} className="spin" style={{ color: 'var(--primary)', margin: '0 auto 0.75rem' }} />
        <p style={{ fontWeight: 500, fontSize: '0.88rem' }}>Loading wallet...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Wallet</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.1rem' }}>
            Balances, rewards & transactions
            {lastSynced && (
              <span style={{ marginLeft: '0.4rem' }}>
                · {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => fetchWalletData(pagination.page, true)}
            disabled={refreshing}
          >
            <RefreshCw size={13} className={refreshing ? 'spin' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onNavigateToPayout}
          >
            <span>Redeem</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-banner error">
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Currency Cards */}
      <CurrencyCards wallet={wallet} metrics={metrics} onRedeemClick={onNavigateToPayout} />

      {/* Earning Hub */}
      <EcosystemRewardsHub wallet={wallet} onNavigateToPayout={onNavigateToPayout} />

      {/* Recent Redemptions */}
      {withdrawals && withdrawals.length > 0 && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={15} style={{ color: 'var(--accent-ve)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Redemptions</h3>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Last {withdrawals.length}
            </span>
          </div>

          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Method</th>
                  <th>Payout</th>
                  <th>VEs</th>
                  <th>Status</th>
                  <th>Destination</th>
                  <th>Date</th>
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
                          title="Copy ID"
                        >
                          <span>{w.withdrawalId.substring(0, 10)}...</span>
                          {isCopied ? <Check size={10} color="var(--color-credit)" /> : <Copy size={10} />}
                        </button>
                      </td>
                      <td style={{ fontWeight: 600 }}>{w.method}</td>
                      <td className="tabular-nums" style={{ fontWeight: 600, color: 'var(--color-credit)' }}>
                        {w.payoutCurrency === 'INR' ? '₹' : '$'}{w.payoutAmount}
                      </td>
                      <td className="tabular-nums" style={{ color: 'var(--accent-ve)' }}>
                        {Number(w.currencyAmount).toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge-status ${w.status.toLowerCase()}`}>{w.status}</span>
                        {w.rejectionReason && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-debit)', marginTop: '2px' }}>
                            {w.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {w.payoutDetails?.maskedUpiId || w.payoutDetails?.upiId || w.payoutDetails?.email || 'N/A'}
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(w.requestedAt).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
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

      {/* Transaction Ledger */}
      <TransactionLedger
        transactions={transactions}
        pagination={pagination}
        onPageChange={handlePageChange}
        loading={false}
      />
    </div>
  );
};
