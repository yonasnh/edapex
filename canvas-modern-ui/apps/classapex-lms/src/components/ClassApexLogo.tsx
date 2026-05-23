import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ClassApexLogoProps {
  size?: number;
  className?: string;
  isCollapsed?: boolean;
}

export const ClassApexLogo: React.FC<ClassApexLogoProps> = ({
  size = 36,
  className = '',
  isCollapsed = false
}) => {
  const { brandConfig, theme } = useTheme();
  const logoUrl = brandConfig?.logoUrl;
  const isDark = theme === 'dark';

  // Theme-aware logos:
  // • Dark mode  → white transparent mark (needs a dark circle bg to show)
  // • Light mode → dark circle baked into PNG (renders on any bg)
  const siloSrc = isDark
    ? '/classapex_logo_darkmode.png'
    : '/classapex_logo_light.png';

  const logoSrc = logoUrl ?? siloSrc;

  // Dark mode logo is white-on-transparent, so we wrap it in a matching
  // dark circle background. Light mode logo is self-contained.
  const imgWrapStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    transition: 'background-color 0.2s ease',
  };

  return (
    <div className={`sidebar-logo ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={imgWrapStyle}>
        <img
          src={logoSrc}
          alt="ClassApex Logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            transition: 'opacity 0.2s ease',
          }}
        />
      </div>
      {!isCollapsed && (
        <div className="sidebar-logo__text" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span
            className="sidebar-logo__title"
            style={{
              fontFamily: "var(--cm-font-family-base, 'Inter', system-ui, -apple-system, sans-serif)",
              fontWeight: 900,
              fontSize: '0.95rem',
              letterSpacing: '-0.04em',
              color: isDark ? '#f8fafc' : '#0f172a',
              lineHeight: 1.1
            }}
          >
            ClassApex
          </span>
          <span
            className="sidebar-logo__subtitle"
            style={{
              fontFamily: "var(--cm-font-family-base, 'Inter', system-ui, -apple-system, sans-serif)",
              fontSize: '0.6rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: isDark ? '#94a3b8' : '#64748b',
              marginTop: '1px',
              opacity: 0.8
            }}
          >
            LEARNING MANAGEMENT
          </span>
        </div>
      )}
    </div>
  );
};

export default ClassApexLogo;
