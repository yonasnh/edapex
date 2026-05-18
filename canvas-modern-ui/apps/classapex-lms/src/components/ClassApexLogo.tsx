import React from 'react';

interface ClassApexLogoProps {
  size?: number;
  className?: string;
}

export const ClassApexLogo: React.FC<ClassApexLogoProps> = ({
  size = 28,
  className = ''
}) => {
  return (
    <div className={`sidebar-logo ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <img 
        src="/classapex_logo_transparent.png" 
        alt="ClassApex Logo" 
        style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain' }} 
      />
      <div className="sidebar-logo__text">
        <span className="sidebar-logo__title" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>ClassApex</span>
        <span className="sidebar-logo__subtitle">Learning Management</span>
      </div>
    </div>
  );
};

export default ClassApexLogo;
