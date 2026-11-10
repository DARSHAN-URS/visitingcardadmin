import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  AlertTriangle,
  XCircle,
  Eye,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { Booking, BookingStatus } from '../types';
import { Modal } from '../components/Modal';

interface BookingsPageProps {
  bookings: Booking[];
  onCancelBooking: (bookingId: string, reason: string) => Promise<void>;
}

export const BookingsPage: React.FC<BookingsPageProps> = ({
  bookings,
  onCancelBooking,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Cancellation modal
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      (b.booking_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.worker_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.city || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCancelClick = (b: Booking) => {
    setCancelModalBooking(b);
    setCancelReason('');
  };

  const submitCancellation = async () => {
    if (!cancelModalBooking || !cancelReason.trim()) return;
    setIsSubmitting(true);
    try {
      await onCancelBooking(cancelModalBooking.id, cancelReason);
      setCancelModalBooking(null);
      setCancelReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="badge verified">Completed</span>;
      case 'CONFIRMED':
      case 'IN_PROGRESS':
      case 'ACCEPTED':
        return <span className="badge confirmed">{status.replace(/_/g, ' ')}</span>;
      case 'PENDING_WORKER_RESPONSE':
        return <span className="badge pending">Pending Response</span>;
      case 'DISPUTED':
        return <span className="badge suspended">Disputed</span>;
      default:
        return <span className="badge rejected">Cancelled</span>;
    }
  };

  return (
    <div className="bookings-page">
      <div className="content-panel">
        <div className="panel-header">
          <div className="panel-title-group">
            <h3>Platform Job Dispatch & Bookings</h3>
            <p>Live stream of consumer service requests, scheduled appointments, and dispute cases</p>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-box" style={{ width: 220 }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Booking ref, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-tabs">
              {[
                { label: 'All Jobs', value: 'ALL' },
                { label: 'Confirmed / Active', value: 'CONFIRMED' },
                { label: 'In Progress', value: 'IN_PROGRESS' },
                { label: 'Completed', value: 'COMPLETED' },
                { label: 'Disputed', value: 'DISPUTED' },
                { label: 'Cancelled', value: 'CUSTOMER_CANCELLED' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  className={`filter-tab ${statusFilter === tab.value ? 'active' : ''}`}
                  onClick={() => setStatusFilter(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Customer Details</th>
                <th>Assigned Specialist</th>
                <th>Service Ordered</th>
                <th>Scheduled Window</th>
                <th>Price & Payment</th>
                <th>Job Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {b.booking_number}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {b.customer_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {b.customer_phone}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {b.locality ? `${b.locality}, ${b.city}` : b.city}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>
                      {b.worker_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {b.worker_trade}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {b.worker_phone}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      {b.service_name}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} color="var(--brand-primary)" />
                      <span>{b.scheduled_date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <Clock size={12} />
                      <span>{b.scheduled_start_time}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      ₹{b.final_price.toLocaleString('en-IN')}
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: b.payment_status === 'PAID' ? 'var(--status-verified)' : 'var(--status-pending)',
                      }}
                    >
                      {b.payment_status} via {b.payment_method}
                    </span>
                  </td>
                  <td>{getStatusBadge(b.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedBooking(b)}
                        title="View Full Booking Dossier"
                      >
                        <Eye size={13} />
                      </button>

                      {b.status !== 'COMPLETED' && b.status !== 'CUSTOMER_CANCELLED' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancelClick(b)}
                          title="Admin Force Cancel / Dispute Resolution"
                        >
                          <XCircle size={13} />
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

      {/* Booking Dossier Modal */}
      <Modal
        isOpen={selectedBooking !== null}
        onClose={() => setSelectedBooking(null)}
        title={selectedBooking ? `Booking Dossier: ${selectedBooking.booking_number}` : ''}
      >
        {selectedBooking && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SERVICE</span>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--brand-primary)' }}>
                  {selectedBooking.service_name}
                </h4>
              </div>
              {getStatusBadge(selectedBooking.status)}
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-dark-700)',
                padding: 14,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Customer Delivery Address:</div>
              <div style={{ color: 'var(--text-secondary)' }}>{selectedBooking.customer_address}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 2 }}>
                {selectedBooking.locality}, {selectedBooking.city}
              </div>
            </div>

            {selectedBooking.notes && (
              <div
                style={{
                  backgroundColor: 'var(--bg-dark-700)',
                  padding: 14,
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Customer Problem Description:</div>
                <p style={{ color: 'var(--text-secondary)' }}>{selectedBooking.notes}</p>
              </div>
            )}

            {selectedBooking.cancellation_reason && (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: 14,
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                }}
              >
                <strong>Cancellation / Dispute Note:</strong> {selectedBooking.cancellation_reason}
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                fontSize: '0.82rem',
                paddingTop: 8,
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Customer:</span>{' '}
                <strong>{selectedBooking.customer_name}</strong> ({selectedBooking.customer_phone})
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Specialist:</span>{' '}
                <strong>{selectedBooking.worker_name}</strong> ({selectedBooking.worker_trade})
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Scheduled Time:</span>{' '}
                <span>
                  {selectedBooking.scheduled_date} at {selectedBooking.scheduled_start_time}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>{' '}
                <strong style={{ color: 'var(--brand-primary)' }}>
                  ₹{selectedBooking.final_price}
                </strong>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Admin Cancellation Modal */}
      <Modal
        isOpen={cancelModalBooking !== null}
        onClose={() => setCancelModalBooking(null)}
        title="Admin Forced Job Cancellation"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setCancelModalBooking(null)}>
              Back
            </button>
            <button
              className="btn btn-danger"
              onClick={submitCancellation}
              disabled={isSubmitting || !cancelReason.trim()}
            >
              {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            You are initiating an administrative cancellation for job{' '}
            <strong>{cancelModalBooking?.booking_number}</strong>. This will notify both customer{' '}
            <strong>{cancelModalBooking?.customer_name}</strong> and worker{' '}
            <strong>{cancelModalBooking?.worker_name}</strong>.
          </p>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Mandatory Reason for Admin Intervention *
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g., Unresolved dispute: Specialist unable to attend emergency call."
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
