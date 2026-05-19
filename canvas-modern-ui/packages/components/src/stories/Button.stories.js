import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, ButtonGroup } from '../ui/button/Button';
const meta = {
    title: 'Components/Button',
    component: Button,
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'ghost', 'destructive'],
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
        disabled: { control: 'boolean' },
        loading: { control: 'boolean' },
    },
    tags: ['autodocs'],
};
export default meta;
export const Primary = {
    args: {
        variant: 'primary',
        children: 'Primary Button',
    },
};
export const Secondary = {
    args: {
        variant: 'secondary',
        children: 'Secondary Button',
    },
};
export const Ghost = {
    args: {
        variant: 'ghost',
        children: 'Ghost Button',
    },
};
export const Destructive = {
    args: {
        variant: 'destructive',
        children: 'Delete',
    },
};
export const Small = {
    args: {
        size: 'sm',
        children: 'Small',
    },
};
export const Large = {
    args: {
        size: 'lg',
        children: 'Large',
    },
};
export const Loading = {
    args: {
        loading: true,
        children: 'Saving...',
    },
};
export const Disabled = {
    args: {
        disabled: true,
        children: 'Disabled',
    },
};
export const AllVariants = {
    render: () => (_jsxs("div", { style: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }, children: [_jsx(Button, { variant: "primary", children: "Primary" }), _jsx(Button, { variant: "secondary", children: "Secondary" }), _jsx(Button, { variant: "ghost", children: "Ghost" }), _jsx(Button, { variant: "destructive", children: "Destructive" })] })),
};
export const AllSizes = {
    render: () => (_jsxs("div", { style: { display: 'flex', gap: 12, alignItems: 'center' }, children: [_jsx(Button, { size: "sm", children: "Small" }), _jsx(Button, { size: "md", children: "Medium" }), _jsx(Button, { size: "lg", children: "Large" })] })),
};
export const ButtonGroupExample = {
    render: () => (_jsxs(ButtonGroup, { children: [_jsx(Button, { variant: "secondary", children: "Cancel" }), _jsx(Button, { children: "Save" })] })),
};
//# sourceMappingURL=Button.stories.js.map