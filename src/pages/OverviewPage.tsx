import React from 'react';
import {
  DollarSign,
  Calendar,
  Users,
  ShieldAlert,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { AdminMetrics, Booking } from '../types';
import { NavTab } from '../components/Sidebar';

interface OverviewPageProps {
  metrics: AdminMetrics;
  recentBookings: Booking[];
  onNavigate: (tab: NavTab) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  metrics,
  recentBookings,
  onNavigate,
}) => {
  return (
    <div className="overview-page">
      {/* Pending KYC Action Alert */}
      {metrics.pending_kyc > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-pending)',
              }}
            >
              <ShieldAlert size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                {metrics.pending_kyc} Blue-Collar Specialist Applications Awaiting Verification
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Workers cannot appear in marketplace discovery until KYC Aadhar and trade certificates are verified.
              </div>
            </div>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate('workers')}
            style={{ whiteSpace: 'nowrap' }}
          >
            Review Queue
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="stat-grid">
        <StatCard
          title="Gross Merchandise Value"
          value={`₹${metrics.total_revenue.toLocaleString('en-IN')}`}
          subtitle="Platform processed payments"
          icon={DollarSign}
          trend="Live ledger"
          trendType="positive"
        />

        <StatCard
          title="Total Service Bookings"
          value={metrics.total_bookings.toLocaleString('en-IN')}
          subtitle={`${metrics.completed_bookings} successfully fulfilled`}
          icon={Calendar}
          trend="Real-time count"
          trendType="positive"
        />

        <StatCard
          title="Verified Specialists"
          value={metrics.verified_workers.toLocaleString('en-IN')}
          subtitle={`${metrics.total_workers} total registered`}
          icon={Users}
          trend={`${metrics.pending_kyc} pending KYC`}
          trendType={metrics.pending_kyc > 0 ? 'neutral' : 'positive'}
        />

        <StatCard
          title="Video Showcase Reels"
          value={metrics.active_videos.toLocaleString('en-IN')}
          subtitle="Approved skill reels"
          icon={Sparkles}
          trend="Live moderation"
          trendType="positive"
        />
      </div>

      {/* Live Analytics & Operating Hubs */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* Live Booking Status Breakdown */}
        <div className="content-panel" style={{ margin: 0 }}>
          <div className="panel-header">
            <div className="panel-title-group">
              <h3>Platform Fulfillment Summary</h3>
              <p>Live distribution across bookings and verification queues</p>
            </div>
            <span className="badge confirmed" style={{ fontSize: '0.75rem' }}>
              <TrendingUp size={12} />
              Live Data
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', height: '180px', padding: '10px 0 0 10px' }}>
            {[
              {
                label: 'Bookings',
                count: metrics.total_bookings,
                color: 'var(--brand-secondary)',
              },
              {
                label: 'Completed',
                count: metrics.completed_bookings,
                color: 'var(--brand-primary)',
              },
              {
                label: 'Verified Pros',
                count: metrics.verified_workers,
                color: '#10B981',
              },
              {
                label: 'Pending KYC',
                count: metrics.pending_kyc,
                color: '#F59E0B',
              },
              {
                label: 'Live Reels',
                count: metrics.active_videos,
                color: '#A855F7',
              },
            ].map((item, idx, arr) => {
              const maxCount = Math.max(1, ...arr.map((a) => a.count));
              const pct = Math.max(12, Math.round((item.count / maxCount) * 90));
              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <span style={{ fontSize: '0.78rem', color: item.color, fontWeight: 700 }}>
                    {item.count}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      height: `${pct}%`,
                      borderRadius: '6px 6px 0 0',
                      background: `linear-gradient(180deg, ${item.color}, rgba(255, 255, 255, 0.05))`,
                      transition: 'all 0.3s ease',
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Operating Cities (Computed from Live Bookings) */}
        <div className="content-panel" style={{ margin: 0 }}>
          <div className="panel-header">
            <div className="panel-title-group">
              <h3>Active Service Hubs</h3>
              <p>Booking activity by city</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(() => {
              const counts: Record<string, number> = {};
              recentBookings.forEach((b) => {
                const c = (b.city || 'Other').trim() || 'Other';
                counts[c] = (counts[c] || 0) + 1;
              });
              const sorted = Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4);
              const totalB = Math.max(1, recentBookings.length);
              const palette = ['var(--brand-primary)', 'var(--brand-secondary)', '#A855F7', '#F59E0B'];

              if (sorted.length === 0) {
                return (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem', padding: '16px 0' }}>
                    No bookings recorded yet. City distribution will appear here automatically.
                  </div>
                );
              }

              return sorted.map(([cityName, count], idx) => {
                const share = Math.round((count / totalB) * 100);
                return (
                  <div key={cityName}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cityName}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{count} ({share}%)</span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: 6,
                        backgroundColor: 'var(--bg-dark-700)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${share}%`,
                          height: '100%',
                          backgroundColor: palette[idx % palette.length],
                          borderRadius: 'var(--radius-full)',
                        }}
                      />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* Recent Bookings Feed */}
      <div className="content-panel">
        <div className="panel-header">
          <div className="panel-title-group">
            <h3>Recent Booking Stream</h3>
            <p>Live on-demand jobs dispatched across active service hubs</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('bookings')}>
            View All Jobs
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Customer & City</th>
                <th>Assigned Specialist</th>
                <th>Service Name</th>
                <th>Schedule</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.slice(0, 5).map((booking) => (
                <tr key={booking.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {booking.booking_number}
                  </td>
                  <td>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {booking.customer_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {booking.city}
                    </div>
                  </td>
                  <td>
                    <div style={{ color: 'var(--brand-primary)', fontWeight: 500 }}>
                      {booking.worker_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {booking.worker_trade}
                    </div>
                  </td>
                  <td>{booking.service_name}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} />
                      <span>
                        {booking.scheduled_date} at {booking.scheduled_start_time}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    ₹{booking.final_price.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        booking.status === 'COMPLETED'
                          ? 'verified'
                          : booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS'
                          ? 'confirmed'
                          : booking.status === 'PENDING_WORKER_RESPONSE'
                          ? 'pending'
                          : 'rejected'
                      }`}
                    >
                      {booking.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
