import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Input, Textarea, Select, Checkbox, Radio, Switch } from '../ui/atoms/Atoms';
const meta = {
    title: 'Components/Input',
    component: Input,
    argTypes: {
        size: { control: 'select', options: ['sm', 'md', 'lg'] },
        disabled: { control: 'boolean' },
        error: { control: 'text' },
        hint: { control: 'text' },
    },
    tags: ['autodocs'],
};
export default meta;
export const DefaultInput = {
    args: {
        label: 'Email',
        placeholder: 'you@example.com',
    },
};
export const WithError = {
    args: {
        label: 'Email',
        placeholder: 'you@example.com',
        error: 'Please enter a valid email address',
        value: 'invalid',
    },
};
export const WithHint = {
    args: {
        label: 'Password',
        type: 'password',
        hint: 'Must be at least 8 characters',
    },
};
export const WithIcon = {
    args: {
        label: 'Search',
        placeholder: 'Search...',
        icon: _jsxs("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", children: [_jsx("circle", { cx: "7", cy: "7", r: "5", stroke: "currentColor", strokeWidth: "1.5" }), _jsx("path", { d: "M11 11l3 3", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })] }),
    },
};
export const TextareaExample = {
    render: () => (_jsx(Textarea, { label: "Description", placeholder: "Enter a description...", rows: 4 })),
};
export const SelectExample = {
    render: () => (_jsx(Select, { label: "Role", options: [
            { value: 'student', label: 'Student' },
            { value: 'teacher', label: 'Teacher' },
            { value: 'admin', label: 'Administrator' },
        ], placeholder: "Select a role..." })),
};
export const CheckboxExample = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: [_jsx(Checkbox, { label: "Option A" }), _jsx(Checkbox, { label: "Option B" }), _jsx(Checkbox, { label: "Option C (disabled)", disabled: true })] })),
};
export const RadioExample = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: [_jsx(Radio, { name: "choice", value: "a", label: "Choice A" }), _jsx(Radio, { name: "choice", value: "b", label: "Choice B" }), _jsx(Radio, { name: "choice", value: "c", label: "Choice C" })] })),
};
export const SwitchExample = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: [_jsx(Switch, { label: "Enable notifications" }), _jsx(Switch, { label: "Dark mode" }), _jsx(Switch, { label: "Disabled option", disabled: true })] })),
};
//# sourceMappingURL=Input.stories.js.map