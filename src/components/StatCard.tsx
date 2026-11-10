import React from 'react';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'positive' | 'neutral' | 'alert';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'positive',
}) => {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <div className="stat-icon-wrapper">
          <Icon size={18} />
        </div>
      </div>

      <div className="stat-value">{value}</div>

      <div className="stat-footer">
        {trend && (
          <span className={`trend-badge ${trendType === 'positive' ? 'positive' : 'neutral'}`}>
            <ArrowUpRight size={12} />
            {trend}
          </span>
        )}
        {subtitle && <span>{subtitle}</span>}
      </div>
    </div>
  );
};
