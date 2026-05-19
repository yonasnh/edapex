import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Drawer } from '../ui/drawer/Drawer';
const meta = {
    title: 'Components/Drawer',
    component: Drawer,
    tags: ['autodocs'],
};
export default meta;
export const Right = {
    args: { isOpen: true, onClose: () => { }, title: 'Drawer Title', children: 'Drawer content goes here.', side: 'right' },
};
export const Left = {
    args: { isOpen: true, onClose: () => { }, title: 'Left Drawer', children: 'Content on the left side.', side: 'left' },
};
export const WithContent = {
    args: {
        isOpen: true,
        onClose: () => { },
        title: 'Course Details',
        children: (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: [_jsx("p", { children: "Course information and settings can be edited here." }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { type: "button", children: "Save" }), _jsx("button", { type: "button", children: "Cancel" })] })] })),
    },
};
//# sourceMappingURL=Drawer.stories.js.map