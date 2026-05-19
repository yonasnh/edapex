import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ProgressBar } from '../ui/progress/ProgressBar';
const meta = {
    title: 'Components/ProgressBar',
    component: ProgressBar,
    tags: ['autodocs'],
};
export default meta;
export const Default = { args: { value: 45, showLabel: true } };
export const Success = { args: { value: 80, variant: 'success', showLabel: true } };
export const Warning = { args: { value: 55, variant: 'warning', showLabel: true } };
export const Danger = { args: { value: 25, variant: 'danger', showLabel: true } };
export const Indeterminate = { args: { indeterminate: true } };
export const Small = { args: { value: 60, size: 'sm' } };
export const Variants = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }, children: [_jsx(ProgressBar, { value: 90, variant: "success", showLabel: true }), _jsx(ProgressBar, { value: 50, variant: "warning", showLabel: true }), _jsx(ProgressBar, { value: 20, variant: "danger", showLabel: true }), _jsx(ProgressBar, { value: 60, showLabel: true })] })),
};
//# sourceMappingURL=ProgressBar.stories.js.map