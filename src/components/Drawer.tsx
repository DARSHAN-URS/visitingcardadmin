import React from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer-panel">
        <div className="drawer-header">
          <div>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}>{title}</h3>
            {subtitle && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>
                {subtitle}
              </p>
            )}
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-content">{children}</div>

        {footer && <div className="drawer-footer">{footer}</div>}
      </div>
    </>
  );
};
