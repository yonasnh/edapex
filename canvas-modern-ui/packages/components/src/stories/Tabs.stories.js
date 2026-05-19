import { jsx as _jsx } from "react/jsx-runtime";
import { Tabs } from '../ui/tabs/Tabs';
const meta = {
    title: 'Components/Tabs',
    component: Tabs,
    argTypes: {
        variant: {
            control: 'select',
            options: ['underline', 'pills'],
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
    },
    tags: ['autodocs'],
};
export default meta;
const sampleTabs = [
    { id: 'overview', label: 'Overview', content: _jsx("div", { style: { padding: '16px 0' }, children: "Overview content with details about this section." }) },
    { id: 'submissions', label: 'Submissions', content: _jsx("div", { style: { padding: '16px 0' }, children: "View and grade student submissions." }) },
    { id: 'grades', label: 'Grades', content: _jsx("div", { style: { padding: '16px 0' }, children: "Grade summary and analytics." }) },
    { id: 'comments', label: 'Comments', badge: 3, content: _jsx("div", { style: { padding: '16px 0' }, children: "Discussion and feedback." }) },
];
export const Underline = {
    args: {
        tabs: sampleTabs,
        variant: 'underline',
    },
};
export const Pills = {
    args: {
        tabs: sampleTabs,
        variant: 'pills',
    },
};
export const WithDisabledTab = {
    args: {
        tabs: [
            ...sampleTabs.slice(0, 2),
            { id: 'disabled', label: 'Disabled', disabled: true, content: null },
            sampleTabs[3],
        ],
    },
};
//# sourceMappingURL=Tabs.stories.js.map