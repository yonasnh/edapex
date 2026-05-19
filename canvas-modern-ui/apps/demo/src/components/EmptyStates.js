import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from 'react';
import { Button } from '@carbon/react';
import { Course, Task as Assignment, Chat, Calendar, Folder, Search, Notification, Group, Add, Upload, Filter } from '@carbon/icons-react';
import clsx from 'clsx';
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
export const EmptyState = memo(({ icon: Icon, title, description, action, secondaryAction, illustration, size = 'md', className, 'data-testid': testId, }) => {
    const iconSizes = {
        sm: 48,
        md: 64,
        lg: 80,
    };
    return (_jsxs("div", { className: clsx('empty-state', `empty-state--${size}`, className), "data-testid": testId, children: [_jsxs("div", { className: "empty-state__content", children: [illustration ? (_jsx("div", { className: "empty-state__illustration", children: illustration })) : Icon ? (_jsx("div", { className: "empty-state__icon", children: _jsx(Icon, { size: iconSizes[size] }) })) : null, _jsxs("div", { className: "empty-state__text", children: [_jsx("h3", { className: "empty-state__title", children: title }), description && (_jsx("p", { className: "empty-state__description", children: description }))] }), (action || secondaryAction) && (_jsxs("div", { className: "empty-state__actions", children: [action && (_jsx(Button, { kind: action.variant || 'primary', size: size === 'sm' ? 'sm' : 'md', renderIcon: action.icon, onClick: action.onClick, children: action.label })), secondaryAction && (_jsx(Button, { kind: secondaryAction.variant || 'secondary', size: size === 'sm' ? 'sm' : 'md', renderIcon: secondaryAction.icon, onClick: secondaryAction.onClick, children: secondaryAction.label }))] }))] }), _jsxs("div", { className: "sr-only", children: ["Empty state: ", title, ".", description && ` ${description}`, action && ` Primary action available: ${action.label}.`, secondaryAction && ` Secondary action available: ${secondaryAction.label}.`] })] }));
});
EmptyState.displayName = 'EmptyState';
/**
 * Empty Courses State
 */
export const EmptyCoursesState = memo(({ onBrowseCourses, onCreateCourse, userRole = 'student', className }) => {
    const isTeacher = userRole === 'teacher' || userRole === 'admin';
    return (_jsx(EmptyState, { icon: Course, title: "No courses found", description: isTeacher
            ? "You haven't created any courses yet. Start by creating your first course."
            : "You haven't enrolled in any courses yet. Browse available courses to get started.", action: isTeacher && onCreateCourse
            ? {
                label: 'Create Course',
                onClick: onCreateCourse,
                icon: Add,
            }
            : onBrowseCourses
                ? {
                    label: 'Browse Courses',
                    onClick: onBrowseCourses,
                }
                : undefined, secondaryAction: isTeacher && onBrowseCourses
            ? {
                label: 'Browse Courses',
                onClick: onBrowseCourses,
                variant: 'secondary',
            }
            : undefined, className: className }));
});
EmptyCoursesState.displayName = 'EmptyCoursesState';
/**
 * Empty Assignments State
 */
export const EmptyAssignmentsState = memo(({ onCreateAssignment, onBrowseAssignments, userRole = 'student', className }) => {
    const isTeacher = userRole === 'teacher' || userRole === 'admin';
    return (_jsx(EmptyState, { icon: Assignment, title: "No assignments found", description: isTeacher
            ? "You haven't created any assignments yet. Create your first assignment to get started."
            : "No assignments are currently available. Check back later or contact your instructor.", action: isTeacher && onCreateAssignment
            ? {
                label: 'Create Assignment',
                onClick: onCreateAssignment,
                icon: Add,
            }
            : onBrowseAssignments
                ? {
                    label: 'View All Assignments',
                    onClick: onBrowseAssignments,
                }
                : undefined, className: className }));
});
EmptyAssignmentsState.displayName = 'EmptyAssignmentsState';
/**
 * Empty Discussions State
 */
export const EmptyDiscussionsState = memo(({ onCreateDiscussion, onBrowseDiscussions, userRole = 'student', className }) => {
    const canCreate = userRole === 'teacher' || userRole === 'admin' || userRole === 'ta';
    return (_jsx(EmptyState, { icon: Chat, title: "No discussions found", description: canCreate
            ? "Start engaging conversations by creating your first discussion topic."
            : "No discussion topics are available yet. Check back later for new conversations.", action: canCreate && onCreateDiscussion
            ? {
                label: 'Start Discussion',
                onClick: onCreateDiscussion,
                icon: Add,
            }
            : onBrowseDiscussions
                ? {
                    label: 'Browse Discussions',
                    onClick: onBrowseDiscussions,
                }
                : undefined, className: className }));
});
EmptyDiscussionsState.displayName = 'EmptyDiscussionsState';
/**
 * Empty Calendar State
 */
export const EmptyCalendarState = memo(({ onCreateEvent, onViewCalendar, className }) => {
    return (_jsx(EmptyState, { icon: Calendar, title: "No events scheduled", description: "Your calendar is empty. Add events to stay organized and never miss important dates.", action: onCreateEvent
            ? {
                label: 'Add Event',
                onClick: onCreateEvent,
                icon: Add,
            }
            : undefined, secondaryAction: onViewCalendar
            ? {
                label: 'View Full Calendar',
                onClick: onViewCalendar,
                variant: 'secondary',
            }
            : undefined, className: className }));
});
EmptyCalendarState.displayName = 'EmptyCalendarState';
/**
 * Empty Files State
 */
export const EmptyFilesState = memo(({ onUploadFile, onCreateFolder, canUpload = true, className }) => {
    return (_jsx(EmptyState, { icon: Folder, title: "No files found", description: canUpload
            ? "This folder is empty. Upload files or create folders to organize your content."
            : "This folder is empty. No files are currently available.", action: canUpload && onUploadFile
            ? {
                label: 'Upload Files',
                onClick: onUploadFile,
                icon: Upload,
            }
            : undefined, secondaryAction: canUpload && onCreateFolder
            ? {
                label: 'Create Folder',
                onClick: onCreateFolder,
                variant: 'secondary',
                icon: Add,
            }
            : undefined, className: className }));
});
EmptyFilesState.displayName = 'EmptyFilesState';
/**
 * Empty Search Results State
 */
export const EmptySearchResultsState = memo(({ query, onClearSearch, onModifySearch, className }) => {
    return (_jsx(EmptyState, { icon: Search, title: "No results found", description: query
            ? `No results found for "${query}". Try adjusting your search terms or filters.`
            : "No results found. Try different search terms or adjust your filters.", action: onClearSearch
            ? {
                label: 'Clear Search',
                onClick: onClearSearch,
                variant: 'secondary',
            }
            : undefined, secondaryAction: onModifySearch
            ? {
                label: 'Modify Filters',
                onClick: onModifySearch,
                variant: 'tertiary',
                icon: Filter,
            }
            : undefined, className: className }));
});
EmptySearchResultsState.displayName = 'EmptySearchResultsState';
/**
 * Empty Notifications State
 */
export const EmptyNotificationsState = memo(({ onViewSettings, className }) => {
    return (_jsx(EmptyState, { icon: Notification, title: "No notifications", description: "You're all caught up! No new notifications at this time.", action: onViewSettings
            ? {
                label: 'Notification Settings',
                onClick: onViewSettings,
                variant: 'secondary',
            }
            : undefined, size: "sm", className: className }));
});
EmptyNotificationsState.displayName = 'EmptyNotificationsState';
/**
 * Empty Groups State
 */
export const EmptyGroupsState = memo(({ onJoinGroup, onCreateGroup, userRole = 'student', className }) => {
    const canCreate = userRole === 'teacher' || userRole === 'admin';
    return (_jsx(EmptyState, { icon: Group, title: "No groups found", description: canCreate
            ? "Create groups to facilitate collaboration and organize students."
            : "You haven't joined any groups yet. Join groups to collaborate with classmates.", action: canCreate && onCreateGroup
            ? {
                label: 'Create Group',
                onClick: onCreateGroup,
                icon: Add,
            }
            : onJoinGroup
                ? {
                    label: 'Find Groups',
                    onClick: onJoinGroup,
                }
                : undefined, className: className }));
});
EmptyGroupsState.displayName = 'EmptyGroupsState';
//# sourceMappingURL=EmptyStates.js.map