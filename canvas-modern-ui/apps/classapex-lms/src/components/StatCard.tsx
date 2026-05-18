import React from 'react';
import clsx from 'clsx';

export interface StatCardProps {
  label: string;
  value: number | string;
  change?: {
    value: string;
    trend: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
  description?: string;
  formatter?: (value: number | string) => string;
}

const ArrowUpSvg = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8 12V4"/>
    <path d="M4 7.5L8 3.5L12 7.5"/>
  </svg>
);

const ArrowDownSvg = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8 4v8"/>
    <path d="M4 8.5L8 12.5L12 8.5"/>
  </svg>
);

const SubtractSvg = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 8h10"/>
  </svg>
);

const Shimmer: React.FC<{ width?: string }> = ({ width = '100%' }) => (
  <div className="cx-shimmer" style={{ width }} />
);

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  icon,
  loading = false,
  className,
  onClick,
  description,
  formatter
}) => {
  const getTrendIcon = () => {
    if (!change) return null;
    switch (change.trend) {
      case 'increase': return <ArrowUpSvg />;
      case 'decrease': return <ArrowDownSvg />;
      case 'neutral': return <SubtractSvg />;
      default: return null;
    }
  };

  const formatValue = (val: number | string): string => {
    if (formatter) return formatter(val);
    if (typeof val === 'number') return val.toLocaleString();
    return val.toString();
  };

  if (loading) {
    return (
      <div className={clsx('analytics-metric analytics-metric--loading', className)}>
        <div className="analytics-metric__icon"><Shimmer width="24px" /></div>
        <div className="analytics-metric__label"><Shimmer width="60%" /></div>
        <div className="analytics-metric__value"><Shimmer width="80%" /></div>
        <div className="analytics-metric__change"><Shimmer width="50%" /></div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'analytics-metric',
        {
          'analytics-metric--clickable': onClick,
          'analytics-metric--with-description': description
        },
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      aria-label={`${label}: ${formatValue(value)}${change ? `, ${change.value}` : ''}${description ? `, ${description}` : ''}`}
    >
      {icon && (
        <div className="analytics-metric__icon" aria-hidden="true">
          {icon}
        </div>
      )}

      <div className="analytics-metric__content">
        <div className="analytics-metric__label">{label}</div>
        <div className="analytics-metric__value">{formatValue(value)}</div>

        {description && (
          <div className="analytics-metric__description">{description}</div>
        )}

        {change && (
          <div className={clsx(
            'analytics-metric__change',
            `analytics-metric__change--${change.trend}`
          )}>
            <span className="analytics-metric__trend-icon" aria-hidden="true">
              {getTrendIcon()}
            </span>
            <span className="analytics-metric__change-text">{change.value}</span>
          </div>
        )}
      </div>

      {onClick && (
        <div className="analytics-metric__click-indicator" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 12.5L4.5 9H6V4H10V9H11.5L8 12.5Z"/>
          </svg>
        </div>
      )}
    </div>
  );
};

export default StatCard;
