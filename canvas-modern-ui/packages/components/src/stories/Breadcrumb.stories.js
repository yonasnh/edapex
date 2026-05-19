import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Breadcrumb } from '../navigation/Breadcrumb';
import { HomeIcon, FileIcon, BookIcon } from '../ui/icon/Icon';
const meta = {
    title: 'Navigation/Breadcrumb',
    component: Breadcrumb,
    tags: ['autodocs'],
    argTypes: {
        maxItems: { control: { type: 'number', min: 2, max: 10 } },
    },
};
export default meta;
export const Default = {
    args: {
        items: [
            { label: 'Home', href: '/' },
            { label: 'Courses', href: '/courses' },
            { label: 'Mathematics 101', href: '/courses/101' },
        ],
    },
};
export const TwoLevels = {
    args: {
        items: [
            { label: 'Home', href: '/' },
            { label: 'Settings', href: '/settings' },
        ],
    },
};
export const WithAutoGeneration = {
    args: {
        pathname: '/courses/101/assignments/42',
        maxItems: 4,
    },
};
export const Collapsed = {
    args: {
        items: [
            { label: 'Home', href: '/' },
            { label: 'Courses', href: '/courses' },
            { label: 'Computer Science', href: '/courses/42' },
            { label: 'Assignments', href: '/courses/42/assignments' },
            { label: 'Project 3', href: '/courses/42/assignments/7' },
        ],
        maxItems: 3,
    },
};
export const WithIcons = {
    args: {
        items: [
            { label: 'Home', href: '/', icon: _jsx(HomeIcon, { size: 14 }) },
            { label: 'Files', href: '/files', icon: _jsx(FileIcon, { size: 14 }) },
            { label: 'Documents', icon: _jsx(BookIcon, { size: 14 }) },
        ],
    },
};
export const DeepPath = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: [_jsx(Breadcrumb, { pathname: "/dashboard" }), _jsx(Breadcrumb, { pathname: "/courses/42/assignments/15" }), _jsx(Breadcrumb, { pathname: "/admin/users/roles/permissions" })] })),
};
//# sourceMappingURL=Breadcrumb.stories.js.map