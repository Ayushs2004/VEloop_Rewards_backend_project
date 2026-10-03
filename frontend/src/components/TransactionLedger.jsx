import React from 'react';
import { ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';

export const TransactionLedger = ({ transactions, pagination, onPageChange, loading }) => {
  return (
    <div className="glass-card" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <History size={20} color="#8b5cf6" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Immutable Wallet Ledger</h3>
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {pagination ? `Total ${pagination.total} entries recorded` : ''}
        </span>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading ledger entries...
        </div>
      ) : !transactions || transactions.length === 0 ? (
        <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No ledger transactions found. Earn or redeem VEs to record entries.
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Balance Before / After</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isCredit = tx.type === 'CREDIT';
                  return (
                    <tr key={tx._id || tx.transactionId}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {tx.transactionId}
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '0.35rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: isCredit ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: isCredit ? '#10b981' : '#ef4444'
                          }}
                        >
                          {isCredit ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {tx.source}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '240px' }}>
                        {tx.description}
                      </td>
                      <td
                        style={{
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: isCredit ? '#10b981' : '#ef4444'
                        }}
                      >
                        {isCredit ? '+' : '-'}
                        {Number(tx.amount).toLocaleString()} {tx.currency}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{Number(tx.balanceBefore).toLocaleString()}</span>
                        {' → '}
                        <span style={{ color: '#8b5cf6', fontWeight: 600 }}>{Number(tx.balanceAfter).toLocaleString()}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(tx.createdAt).toLocaleString(undefined, {
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

          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
              <button
                className="btn-secondary"
                disabled={pagination.page <= 1}
                onClick={() => onPageChange(pagination.page - 1)}
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
              >
                Previous
              </button>
              <span style={{ alignSelf: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="btn-secondary"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange(pagination.page + 1)}
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
