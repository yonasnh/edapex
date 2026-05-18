import React from 'react';

interface SchoolApexLogoProps {
  size?: number;
  className?: string;
}

export const SchoolApexLogo: React.FC<SchoolApexLogoProps> = ({
  size = 28,
  className = ''
}) => {
  return (
    <div className={`sidebar-logo ${className}`}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
        <rect x="2" y="2" width="16" height="16" rx="4" fill="var(--cx-color-primary, #6283fc)" />
        <path d="M6 10l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="sidebar-logo__text">
        <span className="sidebar-logo__title">SchoolApex</span>
        <span className="sidebar-logo__subtitle">Learning Management</span>
      </div>
    </div>
  );
};

export default SchoolApexLogo;
