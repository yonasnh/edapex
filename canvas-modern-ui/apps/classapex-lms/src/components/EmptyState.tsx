import React from 'react';

function DatabaseSvg() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="24" cy="12" rx="16" ry="6"/>
      <path d="M8 12v24c0 3.3 7.2 6 16 6s16-2.7 16-6V12"/>
      <path d="M8 24c0 3.3 7.2 6 16 6s16-2.7 16-6"/>
    </svg>
  );
}

function PlusSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 3v10M3 8h10"/>
    </svg>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  showSeedDataHelp?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  showSeedDataHelp = false
}) => {
  return (
    <div className="cx-empty">
      {icon || <DatabaseSvg />}
      <h3>{title}</h3>
      <p>{description}</p>

      {actionLabel && onAction && (
        <button className="cx-btn cx-btn--primary" onClick={onAction}>
          <PlusSvg /> {actionLabel}
        </button>
      )}

      {showSeedDataHelp && (
        <div className="cx-notification cx-notification--info" style={{ maxWidth: 500, marginTop: 16 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0 }}>
            <circle cx="8" cy="8" r="6"/><path d="M8 5v4"/><circle cx="8" cy="11.5" r="0.5" fill="currentColor"/>
          </svg>
          <div>
            <div className="cx-notification__title">No Canvas LMS Data Found</div>
            <div className="cx-notification__subtitle">
              Run the seed data script to populate Canvas with sample content. See the setup documentation for instructions.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
