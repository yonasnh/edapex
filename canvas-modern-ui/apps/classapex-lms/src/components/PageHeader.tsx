import React from 'react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

export interface BreadcrumbItemType {
  text: string;
  href?: string;
  isCurrentPage?: boolean;
}

export interface ActionButtonType {
  text: string;
  onClick: () => void;
  kind?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  icon?: React.ComponentType<any>;
  disabled?: boolean;
  loading?: boolean;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItemType[];
  actions?: ActionButtonType[];
  tags?: Array<{
    text: string;
    type?: string;
  }>;
  className?: string;
  backgroundGradient?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const angleRight = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
    <path d="M5 3l4 4-4 4"/>
  </svg>
);

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
  breadcrumbs,
  actions,
  tags,
  className,
  backgroundGradient = true,
  size = 'lg'
}) => {
  return (
    <div
      className={clsx(
        'classapex-page-header',
        `classapex-page-header--${size}`,
        {
          'classapex-page-header--with-gradient': backgroundGradient,
          'classapex-page-header--no-gradient': !backgroundGradient
        },
        className
      )}
      role="banner"
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb navigation" className="classapex-page-header__breadcrumbs">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="cx-breadcrumb-item">
              {index > 0 && <span className="cx-breadcrumb-sep">{angleRight}</span>}
              {crumb.href && !crumb.isCurrentPage ? (
                <Link to={crumb.href} className="cx-breadcrumb-link">{crumb.text}</Link>
              ) : (
                <span className={clsx('cx-breadcrumb-text', crumb.isCurrentPage && 'cx-breadcrumb-text--current')}>
                  {crumb.text}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="classapex-page-header__content">
        <div className="classapex-page-header__text">
          <div className="classapex-page-header__title-wrapper">
            <h1 className="classapex-page-header__title">
              {title}
            </h1>

            {tags && tags.length > 0 && (
              <div className="classapex-page-header__tags" aria-label="Page tags">
                {tags.map((tag, index) => (
                  <span key={index} className="cx-badge cx-badge--info">{tag.text}</span>
                ))}
              </div>
            )}
          </div>

          {subtitle && (
            <p className="classapex-page-header__subtitle">{subtitle}</p>
          )}

          {description && (
            <div className="classapex-page-header__description">
              <p>{description}</p>
            </div>
          )}
        </div>

        {actions && actions.length > 0 && (
          <div className="classapex-page-header__actions" role="group" aria-label="Page actions">
            {actions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={index}
                  className={clsx(
                    'cx-btn',
                    action.kind === 'ghost' ? 'cx-btn--ghost' :
                    action.kind === 'secondary' || action.kind === 'tertiary' ? 'cx-btn--secondary' :
                    'cx-btn--primary'
                  )}
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  {IconComponent && <IconComponent />}
                  {action.text}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
