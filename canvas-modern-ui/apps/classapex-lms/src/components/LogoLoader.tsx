import React from 'react';

interface LogoLoaderProps {
  size?: number;
  text?: string;
  dark?: boolean;
}

export const LogoLoader: React.FC<LogoLoaderProps> = ({
  size = 48,
  text,
  dark,
}) => {
  const isDark = dark ?? false;

  const logoSrc = isDark
    ? '/classapex_logo_darkmode.webp'
    : '/classapex_logo_light.webp';

  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
      }}
    >
      <style>{`
        @keyframes logo-pulse {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          animation: 'logo-pulse 2s ease-in-out infinite',
        }}
      >
        <img
          src={logoSrc}
          alt="ClassApex Logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>
      {text && (
        <span
          style={{
            fontFamily:
              "var(--cm-font-family-base, 'Inter', system-ui, -apple-system, sans-serif)",
            fontSize: '0.875rem',
            fontWeight: 500,
            color: isDark ? '#94a3b8' : '#64748b',
            textAlign: 'center',
            animation: 'logo-pulse 2s ease-in-out infinite',
          }}
        >
          {text}
        </span>
      )}
    </div>
  );
};

export default LogoLoader;
