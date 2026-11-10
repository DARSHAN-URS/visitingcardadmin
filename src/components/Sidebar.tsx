import React from 'react';
import {
  LayoutDashboard,
  Users,
  Video,
  Layers,
  CalendarCheck,
  CreditCard,
  Settings,
  ShieldCheck,
} from 'lucide-react';

export type NavTab = 'overview' | 'workers' | 'videos' | 'catalog' | 'bookings' | 'payments' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingKycCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingKycCount,
}) => {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <img src="/logo.png" alt="VISITING CARD Logo" className="sidebar-brand-logo" />
        <div className="sidebar-brand-text">
          <h2>VISITING CARD</h2>
          <span>Admin Console</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => onSelectTab('overview')}
        >
          <LayoutDashboard size={18} />
          <span>Overview</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'workers' ? 'active' : ''}`}
          onClick={() => onSelectTab('workers')}
        >
          <Users size={18} />
          <span>Workers & KYC</span>
          {pendingKycCount > 0 && (
            <span className="nav-badge alert">{pendingKycCount}</span>
          )}
        </button>

        <button
          className={`nav-item ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => onSelectTab('videos')}
        >
          <Video size={18} />
          <span>Video Moderation</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => onSelectTab('catalog')}
        >
          <Layers size={18} />
          <span>Service Catalog</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => onSelectTab('bookings')}
        >
          <CalendarCheck size={18} />
          <span>Bookings & Dispatch</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => onSelectTab('payments')}
        >
          <CreditCard size={18} />
          <span>Payments & Refunds</span>
        </button>

        <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '8px 0' }} />

        <button
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => onSelectTab('settings')}
        >
          <Settings size={18} />
          <span>Console Settings</span>
        </button>
      </nav>

      {/* Footer Environment Indicator */}
      <div className="sidebar-footer">
        <div className="env-pill">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="env-status-dot" />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              Live Production
            </span>
          </div>
          <ShieldCheck size={14} color="var(--brand-primary)" />
        </div>
      </div>
    </aside>
  );
};
