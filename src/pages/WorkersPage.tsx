import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Star,
  Phone,
  MapPin,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { Worker, WorkerStatus } from '../types';
import { Drawer } from '../components/Drawer';
import { Modal } from '../components/Modal';

interface WorkersPageProps {
  workers: Worker[];
  onReviewWorker: (
    workerId: string,
    action: 'APPROVE' | 'REJECT' | 'SUSPEND' | 'ACTIVATE',
    notes: string
  ) => Promise<void>;
}

export const WorkersPage: React.FC<WorkersPageProps> = ({ workers, onReviewWorker }) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Review modal state
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'SUSPEND' | 'ACTIVATE' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDocImage, setSelectedDocImage] = useState<string | null>(null);

  const filteredWorkers = workers.filter((w) => {
    const matchesStatus = selectedStatus === 'ALL' || w.verification_status === selectedStatus;
    const matchesSearch =
      searchQuery === '' ||
      (w.professional_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.trade_category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.operating_city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.primary_phone || '').includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const openInspection = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsDrawerOpen(true);
  };

  const handleActionClick = (type: 'APPROVE' | 'REJECT' | 'SUSPEND' | 'ACTIVATE') => {
    setActionType(type);
    setReviewNotes(
      type === 'APPROVE'
        ? 'All government ID proofs, certificates and safety compliance standards verified.'
        : ''
    );
  };

  const submitReview = async () => {
    if (!selectedWorker || !actionType) return;
    setIsSubmitting(true);
    try {
      await onReviewWorker(selectedWorker.id, actionType, reviewNotes);
      setActionType(null);
      setReviewNotes('');
      setIsDrawerOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="workers-page">
      <div className="content-panel">
        <div className="panel-header">
          <div className="panel-title-group">
            <h3>Specialist Profiles & KYC Verification</h3>
            <p>Review credentials, license documents, and regulate marketplace eligibility</p>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-box" style={{ width: 220 }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search name, phone, trade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-tabs">
              {[
                { label: 'All', value: 'ALL' },
                { label: 'Pending KYC', value: 'PENDING_VERIFICATION' },
                { label: 'Verified', value: 'VERIFIED' },
                { label: 'Suspended', value: 'SUSPENDED' },
                { label: 'Rejected', value: 'REJECTED' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  className={`filter-tab ${selectedStatus === tab.value ? 'active' : ''}`}
                  onClick={() => setSelectedStatus(tab.value)}
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
                <th>Specialist</th>
                <th>Trade Category</th>
                <th>Operating City</th>
                <th>Contact</th>
                <th>Experience</th>
                <th>Rating & Jobs</th>
                <th>KYC Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map((worker) => (
                <tr key={worker.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {worker.avatar_url ? (
                        <img
                          src={worker.avatar_url}
                          alt={worker.professional_name}
                          style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            backgroundColor: 'var(--bg-dark-700)',
                            color: 'var(--brand-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                          }}
                        >
                          {(worker.professional_name || 'P').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {worker.professional_name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          ID: {worker.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '3px 8px',
                        backgroundColor: 'var(--bg-dark-700)',
                        borderRadius: 4,
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        color: 'var(--brand-primary)',
                      }}
                    >
                      {worker.trade_category}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem' }}>
                      <MapPin size={12} color="var(--text-muted)" />
                      <span>{worker.operating_city}</span>
                    </div>
                    {worker.operating_locality && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 16 }}>
                        {worker.operating_locality}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem' }}>
                      <Phone size={12} color="var(--text-muted)" />
                      <span>{worker.primary_phone}</span>
                    </div>
                  </td>
                  <td>{worker.years_experience} yrs</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={13} fill="#F59E0B" color="#F59E0B" />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {worker.average_rating}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ({worker.total_jobs_completed} jobs)
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        worker.verification_status === 'VERIFIED'
                          ? 'verified'
                          : worker.verification_status === 'PENDING_VERIFICATION'
                          ? 'pending'
                          : worker.verification_status === 'SUSPENDED'
                          ? 'suspended'
                          : 'rejected'
                      }`}
                    >
                      {worker.verification_status === 'PENDING_VERIFICATION'
                        ? 'Pending Review'
                        : worker.verification_status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => openInspection(worker)}
                    >
                      Inspect & Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Inspection Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedWorker ? selectedWorker.professional_name : 'Worker Dossier'}
        subtitle={selectedWorker ? `${selectedWorker.trade_category} Specialist • ${selectedWorker.operating_city}` : ''}
        footer={
          selectedWorker && (
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              {selectedWorker.verification_status !== 'VERIFIED' && (
                <button
                  className="btn btn-success"
                  style={{ flex: 1 }}
                  onClick={() => handleActionClick('APPROVE')}
                >
                  <CheckCircle size={16} />
                  Approve & Verify
                </button>
              )}
              {selectedWorker.verification_status !== 'REJECTED' && (
                <button
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                  onClick={() => handleActionClick('REJECT')}
                >
                  <XCircle size={16} />
                  Reject Application
                </button>
              )}
              {selectedWorker.verification_status === 'VERIFIED' && (
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1, color: 'var(--status-suspended)' }}
                  onClick={() => handleActionClick('SUSPEND')}
                >
                  <AlertTriangle size={16} />
                  Suspend Account
                </button>
              )}
            </div>
          )
        }
      >
        {selectedWorker && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Bio & Overview */}
            <div
              style={{
                backgroundColor: 'var(--bg-dark-700)',
                padding: 16,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                PROFESSIONAL SUMMARY
              </div>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                {selectedWorker.bio || 'No professional bio submitted.'}
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 12,
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Experience:</span>{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {selectedWorker.years_experience} Years
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Hourly Rate:</span>{' '}
                  <strong style={{ color: 'var(--brand-primary)' }}>
                    {selectedWorker.hourly_rate ? `₹${selectedWorker.hourly_rate}/hr` : 'Not set'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Verified Phone:</span>{' '}
                  <span style={{ color: 'var(--text-primary)' }}>{selectedWorker.primary_phone}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Registered:</span>{' '}
                  <span style={{ color: 'var(--text-primary)' }}>
                    {new Date(selectedWorker.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Existing Admin Notes */}
            {selectedWorker.admin_notes && (
              <div
                style={{
                  backgroundColor: 'rgba(168, 85, 247, 0.1)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  padding: 12,
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  color: 'var(--text-primary)',
                }}
              >
                <strong>Admin Audit Note:</strong> {selectedWorker.admin_notes}
              </div>
            )}

            {/* KYC Proof Documents */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <Shield size={16} color="var(--brand-primary)" />
                  <span>Submitted KYC Documents ({selectedWorker.documents.length})</span>
                </div>
              </div>

              {selectedWorker.documents.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 24,
                    background: 'var(--bg-dark-700)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                  }}
                >
                  No identity documents uploaded yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {selectedWorker.documents.map((doc) => (
                    <div key={doc.id} className="doc-box">
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FileText size={16} color="var(--brand-primary)" />
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                            {doc.document_type.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span
                          className={`badge ${
                            doc.verification_status === 'VERIFIED'
                              ? 'verified'
                              : doc.verification_status === 'PENDING'
                              ? 'pending'
                              : 'rejected'
                          }`}
                          style={{ fontSize: '0.68rem' }}
                        >
                          {doc.verification_status}
                        </span>
                      </div>

                      <img
                        src={doc.file_url}
                        alt={doc.document_type}
                        className="doc-image-preview"
                        onClick={() => setSelectedDocImage(doc.file_url)}
                      />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Click image to view high-res full scan
                        </span>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                          onClick={() => setSelectedDocImage(doc.file_url)}
                        >
                          <ExternalLink size={12} />
                          Full View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Confirmation & Action Modal */}
      <Modal
        isOpen={actionType !== null}
        onClose={() => setActionType(null)}
        title={
          actionType === 'APPROVE'
            ? 'Approve Specialist Verification'
            : actionType === 'REJECT'
            ? 'Reject Specialist Application'
            : actionType === 'SUSPEND'
            ? 'Suspend Specialist Account'
            : 'Reactivate Specialist'
        }
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setActionType(null)}>
              Cancel
            </button>
            <button
              className={`btn ${actionType === 'APPROVE' ? 'btn-success' : 'btn-danger'}`}
              onClick={submitReview}
              disabled={isSubmitting || (actionType === 'REJECT' && !reviewNotes.trim())}
            >
              {isSubmitting ? 'Processing...' : `Confirm ${actionType}`}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            {actionType === 'APPROVE'
              ? 'Approving this specialist will grant them VERIFIED status and instantly make their profile and videos visible in the customer discovery feed.'
              : actionType === 'REJECT'
              ? 'Rejecting this application will notify the applicant with the mandatory feedback note specified below so they can re-upload valid proofs.'
              : 'Suspension will immediately remove this specialist from active customer searches and prevent accepting new service appointments.'}
          </p>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {actionType === 'REJECT' ? 'Mandatory Reason for Rejection *' : 'Internal Admin Notes'}
            </label>
            <textarea
              rows={3}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder={
                actionType === 'REJECT'
                  ? 'e.g., Aadhar scan is blurry and trade certificate is expired.'
                  : 'Enter review audit notes...'
              }
              style={{
                width: '100%',
                marginTop: 6,
                backgroundColor: 'var(--bg-dark-700)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: 10,
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </Modal>

      {/* High-Res Document Preview Modal */}
      <Modal
        isOpen={selectedDocImage !== null}
        onClose={() => setSelectedDocImage(null)}
        title="High-Resolution Verification Proof"
      >
        {selectedDocImage && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={selectedDocImage}
              alt="Verification Proof"
              style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: 'var(--radius-sm)' }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
