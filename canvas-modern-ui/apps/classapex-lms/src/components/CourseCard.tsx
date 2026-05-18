import React from 'react';
import clsx from 'clsx';

export interface CourseCardProps {
  id: string;
  name: string;
  courseCode: string;
  studentCount?: number;
  teacherCount?: number;
  assignmentCount?: number;
  isPublished?: boolean;
  isActive?: boolean;
  workflowState?: string;
  startAt?: string;
  concludeAt?: string;
  createdAt?: string;
  progress?: {
    completed: number;
    total: number;
  };
  imageUrl?: string;
  bannerImageUrl?: string;
  color?: string;
  syllabusBody?: string;
  description?: string;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
  onEnroll?: () => void;
  showProgress?: boolean;
  compact?: boolean;
}

const UserSvg = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
    <circle cx="8" cy="5.5" r="2.5"/>
    <path d="M3 13.5c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5"/>
  </svg>
);

const TaskSvg = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
    <path d="M5 8l2 2 4-4"/>
    <rect x="2.5" y="2.5" width="11" height="11" rx="2"/>
  </svg>
);

const CalendarSvg = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
    <rect x="2" y="3" width="12" height="11" rx="1.5"/>
    <path d="M2 6h12"/>
    <path d="M5 2v2"/>
    <path d="M11 2v2"/>
  </svg>
);

const ArrowRightSvg = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 3l5 5-5 5"/>
  </svg>
);

const Shimmer: React.FC<{ width?: string }> = ({ width = '100%' }) => (
  <div className="cx-shimmer" style={{ width }} />
);

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  name,
  courseCode,
  studentCount = 0,
  teacherCount = 0,
  assignmentCount = 0,
  isPublished = false,
  workflowState = 'unpublished',
  startAt,
  concludeAt,
  progress,
  imageUrl,
  description,
  loading = false,
  className,
  onClick,
  onEnroll,
  showProgress = true,
  compact = false
}) => {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadge = () => {
    if (isPublished && workflowState === 'available') {
      return <span className="cx-badge cx-badge--success">Active</span>;
    }
    if (workflowState === 'completed') {
      return <span className="cx-badge cx-badge--info">Completed</span>;
    }
    if (workflowState === 'unpublished') {
      return <span className="cx-badge cx-badge--neutral">Draft</span>;
    }
    return <span className="cx-badge cx-badge--neutral">Inactive</span>;
  };

  const calculateProgress = () => {
    if (!progress || progress.total === 0) return 0;
    return Math.round((progress.completed / progress.total) * 100);
  };

  if (loading) {
    return (
      <div className={clsx('course-card course-card--loading', { 'course-card--compact': compact }, className)}>
        <div className="course-card__header">
          <div className="course-card__title-section">
            <Shimmer width="80%" />
            <Shimmer width="40%" />
          </div>
        </div>
        <div className="course-card__content">
          <Shimmer width="100%" />
          <div style={{ height: 8 }} />
          <Shimmer width="100%" />
          {showProgress && !compact && (
            <div className="course-card__progress">
              <Shimmer width="60%" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'course-card',
        {
          'course-card--compact': compact,
          'course-card--clickable': onClick,
          'course-card--published': isPublished && workflowState === 'available',
          'course-card--completed': workflowState === 'completed'
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
      aria-label={`Course: ${name} (${courseCode})`}
    >
      {imageUrl && !compact && (
        <div className="course-card__image">
          <img src={imageUrl} alt={`${name} course banner`} />
        </div>
      )}

      <div className="course-card__header">
        <div className="course-card__title-section">
          <h3 className="course-card__name">{name}</h3>
          <div className="course-card__code">{courseCode}</div>
        </div>
        <div className="course-card__badges">
          {getStatusBadge()}
        </div>
      </div>

      <div className="course-card__content">
        {description && !compact && (
          <p className="course-card__description">{description}</p>
        )}

        <div className="course-card__stats">
          <div className="course-card__stat">
            <UserSvg />
            <span>{studentCount} students</span>
          </div>
          <div className="course-card__stat">
            <TaskSvg />
            <span>{assignmentCount} assignments</span>
          </div>
          {teacherCount > 0 && (
            <div className="course-card__stat">
              <UserSvg />
              <span>{teacherCount} teachers</span>
            </div>
          )}
        </div>

        {!compact && (startAt || concludeAt) && (
          <div className="course-card__dates">
            <div className="course-card__date-item">
              <CalendarSvg />
              <span>
                {startAt ? `Starts: ${formatDate(startAt)}` : 'Start: TBD'}
                {concludeAt && ` • Ends: ${formatDate(concludeAt)}`}
              </span>
            </div>
          </div>
        )}

        {showProgress && progress && !compact && (
          <div className="course-card__progress">
            <div className="course-card__progress-label">
              Progress: {progress.completed} of {progress.total} completed
            </div>
            <div className="cx-progress-bar">
              <div className="cx-progress-bar__track">
                <div
                  className="cx-progress-bar__fill"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
            </div>
            <div className="course-card__progress-stats">
              <span>{calculateProgress()}% complete</span>
            </div>
          </div>
        )}
      </div>

      <div className="course-card__actions">
        {onEnroll && (
          <button
            className="cx-btn cx-btn--secondary cx-btn--sm"
            onClick={(e) => {
              e.stopPropagation();
              onEnroll();
            }}
          >
            Enroll
          </button>
        )}
        <button
          className="cx-btn cx-btn--primary cx-btn--sm"
          onClick={onClick || (() => {})}
        >
          {compact ? 'View' : 'Enter Course'}
          <ArrowRightSvg />
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
