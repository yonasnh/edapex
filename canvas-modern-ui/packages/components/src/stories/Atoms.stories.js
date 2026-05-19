import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, Badge, Modal } from '../ui/atoms/Atoms';
const avatarMeta = {
    title: 'Components/Avatar',
    component: Avatar,
    tags: ['autodocs'],
};
export default avatarMeta;
export const AvatarDefault = { args: { name: 'John Doe', size: 'md' } };
export const AvatarWithImage = {
    args: { name: 'Jane Smith', src: 'https://i.pravatar.cc/80?u=jane', size: 'lg' },
};
export const AvatarSizes = {
    render: () => (_jsxs("div", { style: { display: 'flex', gap: 16, alignItems: 'center' }, children: [_jsx(Avatar, { name: "XS", size: "xs" }), _jsx(Avatar, { name: "Small", size: "sm" }), _jsx(Avatar, { name: "Medium", size: "md" }), _jsx(Avatar, { name: "Large", size: "lg" }), _jsx(Avatar, { name: "XL", size: "xl" })] })),
};
export const AvatarWithStatus = {
    render: () => (_jsxs("div", { style: { display: 'flex', gap: 16, alignItems: 'center' }, children: [_jsx(Avatar, { name: "Alice", status: "online" }), _jsx(Avatar, { name: "Bob", status: "away" }), _jsx(Avatar, { name: "Charlie", status: "offline" })] })),
};
export const AvatarColors = {
    render: () => (_jsx("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' }, children: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'].map(name => (_jsx(Avatar, { name: name }, name))) })),
};
const badgeMeta = {
    title: 'Components/Badge',
    component: Badge,
    tags: ['autodocs'],
};
export const BadgeDefault = {
    render: () => _jsx(Badge, { children: "Default" }),
};
export const BadgeVariants = {
    render: () => (_jsxs("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }, children: [_jsx(Badge, { variant: "default", children: "Default" }), _jsx(Badge, { variant: "primary", children: "Primary" }), _jsx(Badge, { variant: "success", children: "Success" }), _jsx(Badge, { variant: "warning", children: "Warning" }), _jsx(Badge, { variant: "danger", children: "Danger" }), _jsx(Badge, { variant: "info", children: "Info" })] })),
};
export const BadgeDot = {
    render: () => (_jsxs("div", { style: { display: 'flex', gap: 12, alignItems: 'center' }, children: [_jsx(Badge, { variant: "success", dot: true, children: "Online" }), _jsx(Badge, { variant: "warning", dot: true, children: "Away" }), _jsx(Badge, { variant: "danger", dot: true, children: "Offline" })] })),
};
export const BadgeCount = {
    render: () => (_jsxs("div", { style: { display: 'flex', gap: 8, alignItems: 'center' }, children: [_jsx(Badge, { count: 3, variant: "danger" }), _jsx(Badge, { count: 25, variant: "primary" }), _jsx(Badge, { count: 100, variant: "warning" })] })),
};
const modalMeta = {
    title: 'Components/Modal',
    component: Modal,
    tags: ['autodocs'],
};
export const ModalDefault = {
    args: {
        isOpen: true,
        title: 'Modal Title',
        children: 'This is a basic modal with default size.',
        onClose: () => { },
    },
};
export const ModalWithFooter = {
    args: {
        isOpen: true,
        title: 'Confirm Action',
        children: 'Are you sure you want to proceed?',
        footer: _jsxs("div", { style: { display: 'flex', gap: 8, justifyContent: 'flex-end' }, children: [_jsx("button", { type: "button", children: "Cancel" }), _jsx("button", { type: "button", style: { background: '#2563EB', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8 }, children: "Confirm" })] }),
        onClose: () => { },
    },
};
export const ModalSizes = {
    render: () => (_jsx("div", { style: { display: 'flex', gap: 12, flexDirection: 'column' }, children: _jsx(Modal, { isOpen: true, title: "Small", size: "sm", onClose: () => { }, children: "Small modal content" }) })),
};
//# sourceMappingURL=Atoms.stories.js.map