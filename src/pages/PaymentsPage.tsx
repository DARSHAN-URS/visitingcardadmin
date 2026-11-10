import React, { useState } from 'react';
import {
  CreditCard,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  ArrowDownRight,
  ShieldCheck,
} from 'lucide-react';
import { PaymentTransaction } from '../types';
import { Modal } from '../components/Modal';

interface PaymentsPageProps {
  payments: PaymentTransaction[];
  onRefundPayment: (paymentId: string, reason: string) => Promise<void>;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({
  payments,
  onRefundPayment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null);
  const [refundModalPayment, setRefundModalPayment] = useState<PaymentTransaction | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredPayments = payments.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      (p.payment_number || '').toLowerCase().includes(query) ||
      (p.booking_number || '').toLowerCase().includes(query) ||
      (p.customer_name || '').toLowerCase().includes(query) ||
      (p.gateway_payment_id || '').toLowerCase().includes(query)
    );
  });

  const totalVolume = payments
    .filter((p) => p.status === 'PAID')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleRefundSubmit = async () => {
    if (!refundModalPayment || !refundReason.trim()) return;
    setIsSubmitting(true);
    try {
      await onRefundPayment(refundModalPayment.id, refundReason);
      setRefundModalPayment(null);
      setRefundReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="payments-page">
      {/* Top Payments Metric Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--bg-dark-800)',
            padding: 20,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CAPTURED SETTLEMENTS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: 4 }}>
            ₹{totalVolume.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--status-verified)', marginTop: 4 }}>
            100% Razorpay Escrow Verified
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-dark-800)',
            padding: 20,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PLATFORM COMMISSION (15%)</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand-secondary)', marginTop: 4 }}>
            ₹{(totalVolume * 0.15).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Direct marketplace margin
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-dark-800)',
            padding: 20,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SPECIALIST PAYOUTS (85%)</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
            ₹{(totalVolume * 0.85).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Net transferred to workers
          </div>
        </div>
      </div>

      <div className="content-panel">
        <div className="panel-header">
          <div className="panel-title-group">
            <h3>Financial Transactions & Payment Audit Ledger</h3>
            <p>Razorpay order reconciliation, automated GST invoice lookup, and direct refund gateway</p>
          </div>

          <div className="search-box" style={{ width: 260 }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Payment ID, Booking Ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payment Ref</th>
                <th>Booking Ref</th>
                <th>Customer</th>
                <th>Specialist & Job</th>
                <th>Gateway Txn ID</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {p.payment_number}
                  </td>
                  <td>{p.booking_number}</td>
                  <td>{p.customer_name}</td>
                  <td>
                    <div style={{ color: 'var(--brand-primary)', fontWeight: 500 }}>
                      {p.worker_name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {p.service_name}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        backgroundColor: 'var(--bg-dark-700)',
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}
                    >
                      {p.gateway_payment_id}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{p.payment_method}</span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--text-primary)' }}>₹{p.amount}</strong>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        p.status === 'PAID'
                          ? 'verified'
                          : p.status === 'PENDING'
                          ? 'pending'
                          : 'rejected'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {p.invoice_number && (
                        <button
                          className="btn btn-secondary btn-sm"
                          title="View Invoice"
                          onClick={() => setSelectedPayment(p)}
                        >
                          <FileText size={13} />
                        </button>
                      )}

                      {p.status === 'PAID' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--status-rejected)' }}
                          title="Trigger Admin Refund"
                          onClick={() => {
                            setRefundModalPayment(p);
                            setRefundReason('');
                          }}
                        >
                          <RotateCcw size={13} /> Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      <Modal
        isOpen={selectedPayment !== null}
        onClose={() => setSelectedPayment(null)}
        title={selectedPayment ? `Tax Invoice: ${selectedPayment.invoice_number}` : 'Invoice'}
      >
        {selectedPayment && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingBottom: 12,
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <h4 style={{ color: 'var(--brand-primary)', fontSize: '1.2rem' }}>ALTRUIST</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  GSTIN: 29AABCS1429B1Z8
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                <div>Invoice #{selectedPayment.invoice_number}</div>
                <div style={{ color: 'var(--text-muted)' }}>
                  Date: {new Date(selectedPayment.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Billed To:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedPayment.customer_name}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Service Specialist:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedPayment.worker_name}
                </div>
              </div>
            </div>

            <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse', marginTop: 10 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Description</th>
                  <th style={{ padding: '8px 0', textAlign: 'right', color: 'var(--text-muted)' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 0' }}>{selectedPayment.service_name}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right' }}>
                    ₹{(selectedPayment.amount / 1.18).toFixed(2)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Integrated GST (18%)</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', color: 'var(--text-muted)' }}>
                    ₹{(selectedPayment.amount - selectedPayment.amount / 1.18).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 0', fontWeight: 700, fontSize: '0.95rem' }}>Total Paid</td>
                  <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 800, color: 'var(--brand-primary)', fontSize: '1.05rem' }}>
                    ₹{selectedPayment.amount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--status-verified)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <ShieldCheck size={14} /> Paid online via {selectedPayment.gateway} ({selectedPayment.payment_method})
            </div>
          </div>
        )}
      </Modal>

      {/* Refund Trigger Modal */}
      <Modal
        isOpen={refundModalPayment !== null}
        onClose={() => setRefundModalPayment(null)}
        title="Issue Gateway Refund"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setRefundModalPayment(null)}>
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={handleRefundSubmit}
              disabled={isSubmitting || !refundReason.trim()}
            >
              {isSubmitting ? 'Processing...' : `Refund ₹${refundModalPayment?.amount}`}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            You are about to issue a 100% refund of{' '}
            <strong style={{ color: 'var(--brand-primary)' }}>₹{refundModalPayment?.amount}</strong> to{' '}
            <strong>{refundModalPayment?.customer_name}</strong> for transaction{' '}
            <strong>{refundModalPayment?.gateway_payment_id}</strong>.
          </p>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Refund Audit Reason *
            </label>
            <textarea
              rows={3}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="e.g., Customer cancelled before dispatch due to specialist rescheduling."
              style={{
                width: '100%',
                marginTop: 6,
                backgroundColor: 'var(--bg-dark-700)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: 10,
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
