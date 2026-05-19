import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from '../ui/card/Card';
import { BarChartIcon, FileIcon, BookIcon } from '../ui/icon/Icon';
const meta = {
    title: 'Components/Card',
    component: Card,
    tags: ['autodocs'],
    argTypes: {
        variant: { control: 'select', options: ['default', 'stat', 'interactive', 'settings', 'summary'] },
        density: { control: 'select', options: ['comfortable', 'default', 'compact'] },
    },
};
export default meta;
export const Default = {
    args: {
        title: 'Card Title',
        subtitle: 'A short description of this card.',
        children: 'This is the card body content. Cards can contain any content.',
    },
};
export const Stat = {
    args: {
        variant: 'stat',
        icon: _jsx(BarChartIcon, {}),
        title: 'Total Students',
        children: '1,234',
    },
};
export const Interactive = {
    args: {
        variant: 'interactive',
        title: 'Clickable Card',
        subtitle: 'This card responds to clicks and keyboard interaction.',
        children: 'Press Enter or Space to activate.',
        onClick: () => alert('Card clicked!'),
    },
};
export const Selected = {
    args: {
        variant: 'interactive',
        selected: true,
        title: 'Selected Card',
        subtitle: 'This card is in selected state.',
        children: 'Uses a highlighted background and border.',
    },
};
export const Settings = {
    args: {
        variant: 'settings',
        title: 'Settings Card',
        subtitle: 'Configure your preferences.',
        children: 'Settings content goes in the body.',
        footer: _jsx("button", { type: "button", children: "Save Changes" }),
    },
};
export const Summary = {
    args: {
        variant: 'summary',
        title: 'Summary',
        children: 'A summary card with a colored left border accent.',
    },
};
export const WithFooter = {
    args: {
        title: 'Card with Footer',
        children: 'Main content area.',
        footer: (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", children: "Cancel" }), _jsx("button", { type: "button", children: "Save" })] })),
    },
};
export const WithIcon = {
    args: {
        icon: _jsx(FileIcon, {}),
        title: 'Files',
        subtitle: 'Course Materials',
        children: 'Access your course files and documents.',
    },
};
export const Compact = {
    args: {
        density: 'compact',
        title: 'Compact Card',
        children: 'A more condensed layout for data-heavy views.',
    },
};
export const Comfortable = {
    args: {
        density: 'comfortable',
        title: 'Comfortable Card',
        subtitle: 'A roomier layout for reading-focused content.',
        children: 'More padding and breathing room.',
    },
};
export const Densities = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }, children: [_jsx(Card, { density: "comfortable", title: "Comfortable", children: "Spacious padding for reading" }), _jsx(Card, { density: "default", title: "Default", children: "Standard density for most uses" }), _jsx(Card, { density: "compact", title: "Compact", children: "Tight layout for data tables" })] })),
};
export const Variants = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }, children: [_jsx(Card, { title: "Default Card", children: "Basic content card" }), _jsx(Card, { variant: "stat", icon: _jsx(BookIcon, {}), title: "Stat Card", children: "42" }), _jsx(Card, { variant: "interactive", title: "Interactive Card", onClick: () => { }, children: "Clickable with hover effect" }), _jsx(Card, { variant: "settings", title: "Settings Card", footer: _jsx("button", { type: "button", children: "Apply" }), children: "Editable preferences" }), _jsx(Card, { variant: "summary", title: "Summary Card", children: "Accented left border" })] })),
};
//# sourceMappingURL=Card.stories.js.map