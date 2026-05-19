import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Toast } from '../ui/alert/Alert';
const meta = {
    title: 'Components/Toast',
    component: Toast,
    tags: ['autodocs'],
    argTypes: {
        variant: { control: 'select', options: ['info', 'success', 'warning', 'danger'] },
        duration: { control: 'number' },
    },
};
export default meta;
export const Info = {
    args: { variant: 'info', children: 'This is an informational message.', duration: 0 },
};
export const Success = {
    args: { variant: 'success', children: 'Your changes have been saved.', duration: 0 },
};
export const Warning = {
    args: { variant: 'warning', children: 'Your session will expire soon.', duration: 0 },
};
export const Danger = {
    args: { variant: 'danger', children: 'An error occurred while saving.', duration: 0 },
};
export const WithTitle = {
    args: { variant: 'info', title: 'Heads up', children: 'This is a toast with a title.', duration: 0 },
};
export const AllVariants = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }, children: [_jsx(Toast, { variant: "info", duration: 0, children: "This is an informational message." }), _jsx(Toast, { variant: "success", duration: 0, children: "Your changes have been saved successfully." }), _jsx(Toast, { variant: "warning", duration: 0, children: "Your session will expire in 2 minutes." }), _jsx(Toast, { variant: "danger", duration: 0, children: "An error occurred while saving your changes." })] })),
};
//# sourceMappingURL=Toast.stories.js.map