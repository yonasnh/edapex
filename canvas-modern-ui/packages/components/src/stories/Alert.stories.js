import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Alert } from '../ui/alert/Alert';
const meta = {
    title: 'Components/Alert',
    component: Alert,
    argTypes: {
        variant: {
            control: 'select',
            options: ['info', 'success', 'warning', 'danger'],
        },
        dismissible: { control: 'boolean' },
    },
    tags: ['autodocs'],
};
export default meta;
export const Info = {
    args: {
        variant: 'info',
        children: 'This is an informational alert.',
        title: 'Information',
    },
};
export const Success = {
    args: {
        variant: 'success',
        children: 'Your changes have been saved successfully.',
        title: 'Success',
    },
};
export const Warning = {
    args: {
        variant: 'warning',
        children: 'Please review your submission before continuing.',
        title: 'Warning',
    },
};
export const Danger = {
    args: {
        variant: 'danger',
        children: 'There was an error processing your request.',
        title: 'Error',
    },
};
export const AllVariants = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: [_jsx(Alert, { variant: "info", title: "Info", children: "Informational message here." }), _jsx(Alert, { variant: "success", title: "Success", children: "Operation completed." }), _jsx(Alert, { variant: "warning", title: "Warning", children: "Check your input." }), _jsx(Alert, { variant: "danger", title: "Error", children: "Something went wrong." })] })),
};
export const Dismissible = {
    args: {
        variant: 'info',
        title: 'Dismissible Alert',
        children: 'You can dismiss this alert by clicking the close button.',
        dismissible: true,
    },
};
//# sourceMappingURL=Alert.stories.js.map