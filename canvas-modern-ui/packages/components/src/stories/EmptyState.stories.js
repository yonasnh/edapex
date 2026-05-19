import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { EmptyState, EmptyStates } from '../ui/empty/EmptyStates';
const meta = {
    title: 'Components/EmptyState',
    component: EmptyState,
    tags: ['autodocs'],
};
export default meta;
export const Default = {
    args: {
        title: 'No items found',
        description: 'There are no items to display at this time.',
    },
};
export const WithAction = {
    args: {
        title: 'No courses',
        description: 'You are not enrolled in any courses yet.',
        action: { label: 'Browse Courses', onClick: () => { } },
    },
};
export const WithSecondaryAction = {
    args: {
        title: 'No results',
        description: 'Try adjusting your search.',
        action: { label: 'Clear Filters', onClick: () => { } },
        secondaryAction: { label: 'Learn More', onClick: () => { } },
    },
};
export const Error = {
    args: {
        variant: 'error',
        title: 'Something went wrong',
        description: 'An unexpected error occurred. Please try again.',
        action: { label: 'Retry', onClick: () => { } },
    },
};
export const Warning = {
    args: {
        variant: 'warning',
        title: 'Access denied',
        description: "You don't have permission to view this content.",
    },
};
export const Info = {
    args: {
        variant: 'info',
        title: 'Under maintenance',
        description: 'This feature is temporarily unavailable.',
    },
};
export const Small = {
    args: {
        size: 'sm',
        title: 'No items',
        description: 'Nothing to show here.',
    },
};
export const Large = {
    args: {
        size: 'lg',
        title: 'Welcome!',
        description: 'Get started by exploring the available features.',
        action: { label: 'Get Started', onClick: () => { } },
    },
};
export const Presets = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: [_jsx(EmptyStates.NoCourses, {}), _jsx(EmptyStates.NoAssignments, {}), _jsx(EmptyStates.NoDiscussions, {}), _jsx(EmptyStates.NoEvents, {}), _jsx(EmptyStates.NoSearchResults, {}), _jsx(EmptyStates.NetworkError, {}), _jsx(EmptyStates.Unauthorized, {}), _jsx(EmptyStates.Maintenance, {})] })),
};
//# sourceMappingURL=EmptyState.stories.js.map