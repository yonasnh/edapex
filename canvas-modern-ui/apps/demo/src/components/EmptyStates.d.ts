import React from 'react';
/**
 * Empty State component props
 */
interface EmptyStateProps {
    icon?: React.ComponentType<any>;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary' | 'tertiary';
        icon?: React.ComponentType<any>;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary' | 'tertiary';
        icon?: React.ComponentType<any>;
    };
    illustration?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    'data-testid'?: string;
}
/**
 * SchoolApex Empty State component
 *
 * Engaging empty state component with customizable icons, actions, and messaging.
 * Provides clear guidance to users when content is not available.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Course}
 *   title="No courses found"
 *   description="You haven't enrolled in any courses yet."
 *   action={{
 *     label: "Browse Courses",
 *     onClick: handleBrowseCourses
 *   }}
 * />
 * ```
 */
export declare const EmptyState: React.NamedExoticComponent<EmptyStateProps>;
/**
 * Empty Courses State
 */
export declare const EmptyCoursesState: React.NamedExoticComponent<{
    onBrowseCourses?: () => void;
    onCreateCourse?: () => void;
    userRole?: string;
    className?: string;
}>;
/**
 * Empty Assignments State
 */
export declare const EmptyAssignmentsState: React.NamedExoticComponent<{
    onCreateAssignment?: () => void;
    onBrowseAssignments?: () => void;
    userRole?: string;
    className?: string;
}>;
/**
 * Empty Discussions State
 */
export declare const EmptyDiscussionsState: React.NamedExoticComponent<{
    onCreateDiscussion?: () => void;
    onBrowseDiscussions?: () => void;
    userRole?: string;
    className?: string;
}>;
/**
 * Empty Calendar State
 */
export declare const EmptyCalendarState: React.NamedExoticComponent<{
    onCreateEvent?: () => void;
    onViewCalendar?: () => void;
    className?: string;
}>;
/**
 * Empty Files State
 */
export declare const EmptyFilesState: React.NamedExoticComponent<{
    onUploadFile?: () => void;
    onCreateFolder?: () => void;
    canUpload?: boolean;
    className?: string;
}>;
/**
 * Empty Search Results State
 */
export declare const EmptySearchResultsState: React.NamedExoticComponent<{
    query?: string;
    onClearSearch?: () => void;
    onModifySearch?: () => void;
    className?: string;
}>;
/**
 * Empty Notifications State
 */
export declare const EmptyNotificationsState: React.NamedExoticComponent<{
    onViewSettings?: () => void;
    className?: string;
}>;
/**
 * Empty Groups State
 */
export declare const EmptyGroupsState: React.NamedExoticComponent<{
    onJoinGroup?: () => void;
    onCreateGroup?: () => void;
    userRole?: string;
    className?: string;
}>;
export {};
//# sourceMappingURL=EmptyStates.d.ts.map