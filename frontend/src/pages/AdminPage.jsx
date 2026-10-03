import React, { useState, useEffect } from 'react';
import { adminApi, withdrawalApi, walletApi } from '../api/client';
import { Shield, Check, X, RefreshCw, AlertCircle, FileText, ArrowRightLeft } from 'lucide-react';

export const AdminPage = () => {
  const [stats, setStats] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Manual Adjustment Form state
  const [adjustment, setAdjustment] = useState({
    userId: '',
    type: 'credit',
    amount: '',
    currency: 'VEs',
    description: ''
  });

  // Rejection modal state
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('Invalid beneficiary details');

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsRes, withdrawalsRes, logsRes] = await Promise.all([
        adminApi.getStats(),
        withdrawalApi.getWithdrawals(filterStatus ? `status=${filterStatus}` : ''),
        adminApi.getAuditLogs('limit=15')
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (withdrawalsRes.success) setWithdrawals(withdrawalsRes.data);
      if (logsRes.success) setAuditLogs(logsRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [filterStatus]);

  const handleApprove = async (withdrawalId) => {
    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await withdrawalApi.adminApprove(withdrawalId, {
        reviewNote: 'Approved via Admin Portal'
      });
      if (res.success) {
        setSuccessMsg(`Withdrawal ${withdrawalId} approved successfully.`);
        fetchAdminData();
      }
    } catch (err) {
      setError(err.message || 'Failed to approve withdrawal.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await withdrawalApi.adminReject(rejectingId, {
        reason: rejectReason
      });
      if (res.success) {
        setSuccessMsg(`Withdrawal ${rejectingId} rejected. Deducted balance has been safely refunded to user ledger.`);
        setRejectingId(null);
        fetchAdminData();
      }
    } catch (err) {
      setError(err.message || 'Failed to reject withdrawal.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustmentSubmit = async (e) => {
    e.preventDefault();
    if (!adjustment.userId || !adjustment.amount) {
      setError('Please provide User ID and Amount');
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      let res;
      const payload = {
        userId: adjustment.userId.trim(),
        currency: adjustment.currency,
        amount: parseFloat(adjustment.amount),
        description: adjustment.description || `Manual admin ${adjustment.type}`
      };

      if (adjustment.type === 'credit') {
        res = await walletApi.adminCredit(payload);
      } else {
        res = await walletApi.adminDebit(payload);
      }

      if (res.success) {
        setSuccessMsg(`Successfully executed admin ${adjustment.type} of ${adjustment.amount} ${adjustment.currency}!`);
        setAdjustment({ ...adjustment, amount: '', description: '' });
        fetchAdminData();
      }
    } catch (err) {
      setError(err.message || 'Adjustment failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ec4899' }}>
            <Shield size={20} />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase' }}>Internal Admin Operations</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>
            System Ledger & Payout Administration
          </h1>
        </div>

        <button className="btn-secondary" onClick={fetchAdminData} disabled={loading || actionLoading}>
          <RefreshCw size={16} /> Refresh Data
        </button>
      </div>

      {error && <div className="alert-banner error">{error}</div>}
      {successMsg && <div className="alert-banner success">{successMsg}</div>}

      {/* Overview Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="glass-card">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Registered Users</span>
            <h2 style={{ fontSize: '2rem', marginTop: '0.25rem' }}>{stats.users?.total || 0}</h2>
          </div>

          <div className="glass-card" style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}>
            <span style={{ fontSize: '0.8rem', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 600 }}>Pending Review</span>
            <h2 style={{ fontSize: '2rem', marginTop: '0.25rem', color: '#f59e0b' }}>
              {stats.withdrawals?.pending || 0}
            </h2>
          </div>

          <div className="glass-card" style={{ borderColor: 'rgba(16, 185, 129, 0.4)' }}>
            <span style={{ fontSize: '0.8rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 600 }}>Approved Payouts</span>
            <h2 style={{ fontSize: '2rem', marginTop: '0.25rem', color: '#10b981' }}>
              {stats.withdrawals?.approved || 0}
            </h2>
          </div>

          <div className="glass-card">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Circulating VEs</span>
            <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem', color: '#c4b5fd' }}>
              {Number(stats.circulation?.totalVEs || 0).toLocaleString()} VEs
            </h2>
          </div>
        </div>
      )}

      {/* Withdrawals Moderation Table */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Withdrawal Requests Management</h3>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className="btn-secondary"
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  borderColor: filterStatus === st ? '#8b5cf6' : 'var(--border-color)',
                  background: filterStatus === st ? 'rgba(139, 92, 246, 0.2)' : 'transparent'
                }}
              >
                {st || 'All'}
              </button>
            ))}
          </div>
        </div>

        {withdrawals.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No withdrawals found matching the selected filter.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Withdrawal ID</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>VEs Deducted</th>
                  <th>Recipient Details</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.withdrawalId}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{w.withdrawalId}</td>
                    <td style={{ fontWeight: 600 }}>{w.method}</td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>
                      {w.payoutCurrency === 'INR' ? '₹' : '$'}{w.payoutAmount}
                    </td>
                    <td style={{ color: '#c4b5fd', fontWeight: 600 }}>
                      {Number(w.currencyAmount).toLocaleString()} VEs
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {w.payoutDetails?.maskedUpiId || w.payoutDetails?.upiId || w.payoutDetails?.email || 'N/A'}
                    </td>
                    <td>
                      <span className={`badge-status ${w.status.toLowerCase()}`}>
                        {w.status}
                      </span>
                    </td>
                    <td>
                      {w.status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn-success"
                            onClick={() => handleApprove(w.withdrawalId)}
                            disabled={actionLoading}
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => setRejectingId(w.withdrawalId)}
                            disabled={actionLoading}
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          >
                            <X size={14} /> Reject & Refund
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Admin Balance Adjustment Widget */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Manual Admin Wallet Adjustment (Ledger Direct)
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Simulate administrative credits/debits. All balance adjustments strictly write an immutable ledger record and an audit log.
        </p>

        <form onSubmit={handleAdjustmentSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Target User ID (MongoDB ObjectId)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 64f8a... (use demo user id)"
              value={adjustment.userId}
              onChange={(e) => setAdjustment({ ...adjustment, userId: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Operation Type</label>
            <select
              className="form-input"
              value={adjustment.type}
              onChange={(e) => setAdjustment({ ...adjustment, type: e.target.value })}
            >
              <option value="credit">CREDIT (Add)</option>
              <option value="debit">DEBIT (Deduct)</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Amount</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 1000"
              value={adjustment.amount}
              onChange={(e) => setAdjustment({ ...adjustment, amount: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Currency</label>
            <select
              className="form-input"
              value={adjustment.currency}
              onChange={(e) => setAdjustment({ ...adjustment, currency: e.target.value })}
            >
              <option value="VEs">VEs</option>
              <option value="SVEs">SVEs</option>
              <option value="Gems">Gems</option>
              <option value="Tokens">Tokens</option>
              <option value="Spins">Spins</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={actionLoading} style={{ padding: '0.75rem' }}>
            Execute Adjustment
          </button>
        </form>
      </div>

      {/* Audit Logs Trail */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <FileText size={18} color="#8b5cf6" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Security & Audit Log Trail</h3>
        </div>

        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Audit ID</th>
                <th>Action</th>
                <th>Target Type</th>
                <th>Reference ID</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.auditId || log._id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {log.auditId}
                  </td>
                  <td style={{ fontWeight: 600, color: '#c4b5fd' }}>{log.action}</td>
                  <td>{log.targetType}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.referenceId || 'N/A'}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(log.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectingId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Confirm Withdrawal Rejection & Safe Refund
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Rejecting withdrawal <strong style={{ fontFamily: 'monospace' }}>{rejectingId}</strong> will immediately execute
              an atomic ledger refund reversal, returning all debited VEs back to the user's wallet.
            </p>

            <div className="form-group">
              <label className="form-label">Rejection Reason</label>
              <textarea
                className="form-input"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                className="btn-secondary"
                onClick={() => setRejectingId(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={handleReject}
                disabled={actionLoading}
              >
                Confirm Rejection & Reversal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
