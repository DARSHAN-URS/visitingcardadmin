import React from 'react';
import { Search, RefreshCw, Bell, Radio } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  searchTerm,
  onSearchChange,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-title">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="header-right">
        {/* Global Search */}
        <div className="search-box">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search workers, bookings, IDs..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Live API Status Pill */}
        <div
          className="btn btn-secondary btn-sm"
          style={{ gap: 6, cursor: 'default' }}
          title="Connected to live FastAPI backend"
        >
          <Radio size={14} color="var(--status-verified)" />
          <span>Live API</span>
        </div>

        {/* Refresh Button */}
        <button
          className="btn-icon"
          onClick={onRefresh}
          title="Refresh current data"
        >
          <RefreshCw
            size={16}
            style={{
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
            }}
          />
        </button>

        {/* Notifications Icon */}
        <button className="btn-icon" title="Notifications">
          <Bell size={16} />
        </button>

        {/* Admin Profile */}
        <div className="admin-profile-pill">
          <div className="admin-avatar">AD</div>
          <div className="admin-profile-info">
            <div className="name">Operations Admin</div>
            <div className="role">SUPER_ADMIN</div>
          </div>
        </div>
      </div>
    </header>
  );
};
