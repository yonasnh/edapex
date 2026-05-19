import { jsx as _jsx } from "react/jsx-runtime";
import { Popover } from '../ui/popover/Popover';
const meta = {
    title: 'Components/Popover',
    component: Popover,
    tags: ['autodocs'],
};
export default meta;
export const Bottom = {
    args: {
        trigger: _jsx("button", { type: "button", children: "Hover me" }),
        children: 'Popover content',
        open: true,
        placement: 'bottom',
    },
};
export const Top = {
    args: {
        trigger: _jsx("button", { type: "button", children: "Top popover" }),
        children: 'Content above',
        open: true,
        placement: 'top',
    },
};
//# sourceMappingURL=Popover.stories.js.map