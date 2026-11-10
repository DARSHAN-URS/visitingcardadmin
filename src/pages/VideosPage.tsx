import React, { useState } from 'react';
import {
  Video,
  Play,
  Pause,
  Check,
  X,
  Trash2,
  RotateCcw,
  AlertOctagon,
  Eye,
  Heart,
  Tag,
  Clock,
} from 'lucide-react';
import { VideoReel, VideoStatus } from '../types';
import { Modal } from '../components/Modal';

interface VideosPageProps {
  videos: VideoReel[];
  onReviewVideo: (
    videoId: string,
    action: 'APPROVE' | 'REJECT' | 'REMOVE' | 'RESTORE',
    reason?: string
  ) => Promise<void>;
}

export const VideosPage: React.FC<VideosPageProps> = ({ videos, onReviewVideo }) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);

  // Moderation action modal
  const [modalVideo, setModalVideo] = useState<VideoReel | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'REMOVE' | 'RESTORE' | null>(null);
  const [moderationReason, setModerationReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredVideos = videos.filter((v) => {
    if (selectedStatus === 'ALL') return true;
    return v.moderation_status === selectedStatus;
  });

  const openActionModal = (video: VideoReel, action: 'APPROVE' | 'REJECT' | 'REMOVE' | 'RESTORE') => {
    setModalVideo(video);
    setActionType(action);
    setModerationReason('');
  };

  const confirmAction = async () => {
    if (!modalVideo || !actionType) return;
    setIsSubmitting(true);
    try {
      await onReviewVideo(modalVideo.id, actionType, moderationReason);
      setModalVideo(null);
      setActionType(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="videos-page">
      <div className="content-panel">
        <div className="panel-header">
          <div className="panel-title-group">
            <h3>Showcase Video Reels Moderation</h3>
            <p>Inspect 30-second skill videos submitted by blue-collar workers before customer broadcasting</p>
          </div>

          <div className="filter-tabs">
            {[
              { label: 'All Videos', value: 'ALL' },
              { label: 'Pending Review', value: 'PENDING' },
              { label: 'Approved', value: 'APPROVED' },
              { label: 'Rejected', value: 'REJECTED' },
              { label: 'Removed / Flagged', value: 'REMOVED' },
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

        {filteredVideos.length === 0 ? (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
            }}
          >
            No showcase videos found matching this filter criteria.
          </div>
        ) : (
          <div className="video-grid">
            {filteredVideos.map((video) => (
              <div key={video.id} className="video-card">
                {/* Video Playback Canvas */}
                <div className="video-player-container">
                  <video
                    src={video.video_url}
                    poster={video.thumbnail_url}
                    controls
                    playsInline
                    preload="metadata"
                  />
                  <div className="video-overlay-badge">
                    <span
                      className={`badge ${
                        video.moderation_status === 'APPROVED'
                          ? 'verified'
                          : video.moderation_status === 'PENDING'
                          ? 'pending'
                          : 'rejected'
                      }`}
                      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(14, 18, 27, 0.85)' }}
                    >
                      {video.moderation_status}
                    </span>
                  </div>
                </div>

                {/* Video Info */}
                <div className="video-card-body">
                  <div className="video-card-title">{video.title}</div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {video.caption}
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '4px 0' }}>
                    {video.hashtags.map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--brand-primary)',
                          background: 'var(--bg-dark-700)',
                          padding: '2px 6px',
                          borderRadius: 4,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="video-card-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Tag size={12} color="var(--brand-primary)" />
                      <strong style={{ color: 'var(--brand-primary)' }}>₹{video.price_from}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Eye size={12} /> {video.views_count}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Heart size={12} /> {video.likes_count}
                      </span>
                      {video.reports_count > 0 && (
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            color: 'var(--status-rejected)',
                            fontWeight: 700,
                          }}
                        >
                          <AlertOctagon size={12} /> {video.reports_count} flags
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Specialist Attribution */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px',
                      background: 'var(--bg-dark-700)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {video.worker_name}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                        {video.worker_trade}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--text-muted)' }}>
                      <Clock size={12} /> {video.duration_seconds}s
                    </div>
                  </div>

                  {video.moderation_reason && (
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--status-rejected)',
                        background: 'var(--status-rejected-bg)',
                        padding: '6px 8px',
                        borderRadius: 4,
                      }}
                    >
                      <strong>Reason:</strong> {video.moderation_reason}
                    </div>
                  )}

                  {/* Moderation Controls */}
                  <div className="video-actions">
                    {video.moderation_status !== 'APPROVED' && (
                      <button
                        className="btn btn-success btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => openActionModal(video, 'APPROVE')}
                      >
                        <Check size={14} /> Approve
                      </button>
                    )}

                    {video.moderation_status !== 'REJECTED' && video.moderation_status !== 'REMOVED' && (
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => openActionModal(video, 'REJECT')}
                      >
                        <X size={14} /> Reject
                      </button>
                    )}

                    {video.moderation_status === 'APPROVED' && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--status-rejected)' }}
                        onClick={() => openActionModal(video, 'REMOVE')}
                        title="Force remove from feed"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    {(video.moderation_status === 'REJECTED' || video.moderation_status === 'REMOVED') && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openActionModal(video, 'RESTORE')}
                        title="Restore video"
                      >
                        <RotateCcw size={14} /> Restore
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Moderation Confirmation Modal */}
      <Modal
        isOpen={modalVideo !== null}
        onClose={() => setModalVideo(null)}
        title={
          actionType === 'APPROVE'
            ? 'Approve Video Reel'
            : actionType === 'REJECT'
            ? 'Reject Video Reel'
            : actionType === 'REMOVE'
            ? 'Force Remove Video'
            : 'Restore Video'
        }
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalVideo(null)}>
              Cancel
            </button>
            <button
              className={`btn ${actionType === 'APPROVE' || actionType === 'RESTORE' ? 'btn-success' : 'btn-danger'}`}
              onClick={confirmAction}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : `Confirm ${actionType}`}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            {actionType === 'APPROVE'
              ? `Publish "${modalVideo?.title}" to the live vertical customer video reels feed.`
              : actionType === 'REJECT'
              ? `Reject "${modalVideo?.title}" and notify ${modalVideo?.worker_name} with the moderation guidelines note.`
              : actionType === 'REMOVE'
              ? `Immediately hide this video from search, map pins, and customer feeds due to safety or policy violation.`
              : `Restore this video reel back to public discovery.`}
          </p>

          {(actionType === 'REJECT' || actionType === 'REMOVE') && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Moderation Reason / Violation Details *
              </label>
              <textarea
                rows={3}
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                placeholder="e.g., Unsafe working conditions, low video clarity, or misleading pricing."
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
          )}
        </div>
      </Modal>
    </div>
  );
};
