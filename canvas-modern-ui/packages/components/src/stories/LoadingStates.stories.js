import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LoadingSpinner, SkeletonCard, SkeletonTable, SkeletonList, InlineLoading } from '../ui/loading/LoadingStates';
const spinnerMeta = {
    title: 'Components/LoadingStates/Spinner',
    component: LoadingSpinner,
    tags: ['autodocs'],
};
export default spinnerMeta;
export const SpinnerSmall = { args: { size: 'sm' } };
export const SpinnerMedium = { args: { size: 'md' } };
export const SpinnerLarge = { args: { size: 'lg' } };
export const SpinnerWithOverlay = {
    args: { size: 'lg', withOverlay: true, description: 'Loading content...' },
    parameters: { docs: { storyDescription: 'Full-page loading overlay.' } },
};
export const SkeletonCardExample = {
    render: () => _jsx(SkeletonCard, { count: 3, showAvatar: true, showActions: true }),
};
export const SkeletonTableExample = {
    render: () => _jsx(SkeletonTable, { rows: 5, columns: 4 }),
};
export const SkeletonListExample = {
    render: () => _jsx(SkeletonList, { count: 4, showAvatar: true, showMeta: true }),
};
export const PageLoadingExample = {
    args: {
        title: 'Loading Dashboard',
        description: 'Please wait while we prepare your dashboard.',
    },
};
export const InlineLoadingExample = {
    args: { status: 'active', description: 'Saving changes...' },
};
export const InlineLoadingStates = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: [_jsx(InlineLoading, { status: "inactive", description: "Idle" }), _jsx(InlineLoading, { status: "active", description: "Processing..." }), _jsx(InlineLoading, { status: "finished", successDescription: "Done" }), _jsx(InlineLoading, { status: "error", errorDescription: "Failed" })] })),
};
//# sourceMappingURL=LoadingStates.stories.js.map