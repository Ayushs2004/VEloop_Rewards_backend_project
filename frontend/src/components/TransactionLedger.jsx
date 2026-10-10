import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, History, Search, Copy, Check, Filter } from 'lucide-react';

export const TransactionLedger = ({ transactions, pagination, onPageChange, loading }) => {
  const [copiedId, setCopiedId] = useState(null);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'CREDIT' | 'DEBIT'
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Client-side quick filter on current page entries
  const filteredTransactions = (transactions || []).filter((tx) => {
    if (filterType !== 'ALL' && tx.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = (tx.transactionId || '').toLowerCase().includes(q);
      const matchDesc = (tx.description || '').toLowerCase().includes(q);
      const matchSrc = (tx.source || '').toLowerCase().includes(q);
      if (!matchId && !matchDesc && !matchSrc) return false;
    }
    return true;
  });

  return (
    <div className="glass-card" style={{ marginTop: '2.5rem' }}>
      {/* Header & Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <History size={16} color="#818cf8" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Transaction Ledger</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {pagination ? `${pagination.total} immutable ledger entries` : 'Live account activity'}
            </p>
          </div>
        </div>

        {/* Filter Chips & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Search box */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search activity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: '2.1rem',
                paddingTop: '0.4rem',
                paddingBottom: '0.4rem',
                fontSize: '0.82rem',
                width: '180px'
              }}
            />
            <Search
              size={13}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
          </div>

          {/* Type filters */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-input)',
              padding: '2px',
              borderRadius: '7px',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {['ALL', 'CREDIT', 'DEBIT'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                style={{
                  padding: '0.3rem 0.65rem',
                  borderRadius: '5px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: filterType === type ? '#ffffff' : 'var(--text-muted)',
                  background: filterType === type ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  cursor: 'pointer'
                }}
              >
                {type === 'ALL' ? 'All' : type === 'CREDIT' ? '+ Credit' : '- Debit'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading ledger entries...
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          {searchQuery || filterType !== 'ALL'
            ? 'No ledger transactions match your search filter.'
            : 'No transaction history recorded yet.'}
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>Source / Action</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Balance Flow</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => {
                  const isCredit = tx.type === 'CREDIT';
                  const txId = tx.transactionId || tx._id;
                  const isCopied = copiedId === txId;

                  return (
                    <tr key={txId}>
                      <td>
                        <button
                          type="button"
                          className="copy-pill"
                          onClick={() => handleCopy(txId)}
                          title="Click to copy Transaction ID"
                        >
                          <span>{txId.substring(0, 14)}...</span>
                          {isCopied ? <Check size={11} color="#34d399" /> : <Copy size={11} />}
                        </button>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            background: isCredit ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: isCredit ? '#34d399' : '#f87171'
                          }}
                        >
                          {isCredit ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {tx.source}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '240px' }}>
                        {tx.description}
                      </td>
                      <td
                        className="tabular-nums"
                        style={{
                          fontWeight: 700,
                          fontSize: '0.92rem',
                          color: isCredit ? '#34d399' : '#f87171',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {isCredit ? '+' : '-'}
                        {Number(tx.amount).toLocaleString()} {tx.currency || 'VEs'}
                      </td>
                      <td className="tabular-nums" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        <span>{Number(tx.balanceBefore).toLocaleString()}</span>
                        <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>→</span>
                        <span style={{ color: '#c4b5fd', fontWeight: 600 }}>{Number(tx.balanceAfter).toLocaleString()}</span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
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
            <div className="pagination-bar">
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total entries)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={pagination.page <= 1}
                  onClick={() => onPageChange(pagination.page - 1)}
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => onPageChange(pagination.page + 1)}
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
