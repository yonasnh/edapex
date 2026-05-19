import { jsx as _jsx } from "react/jsx-runtime";
import { Table } from '../ui/table/Table';
import { Badge } from '../ui/atoms/Atoms';
const meta = {
    title: 'Components/Table',
    component: Table,
    tags: ['autodocs'],
};
export default meta;
const data = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', grade: 'A', status: 'active' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', grade: 'B+', status: 'active' },
    { id: 3, name: 'Carol Davis', email: 'carol@example.com', grade: 'A-', status: 'active' },
    { id: 4, name: 'David Wilson', email: 'david@example.com', grade: 'C', status: 'inactive' },
    { id: 5, name: 'Eve Martinez', email: 'eve@example.com', grade: 'B', status: 'active' },
];
const columns = [
    { id: 'name', header: 'Name', accessor: (row) => row.name, sortable: true },
    { id: 'email', header: 'Email', accessor: (row) => row.email, sortable: true },
    { id: 'grade', header: 'Grade', accessor: (row) => _jsx("strong", { children: row.grade }), sortable: true },
    {
        id: 'status',
        header: 'Status',
        accessor: (row) => (_jsx(Badge, { variant: row.status === 'active' ? 'success' : 'default', size: "sm", children: row.status })),
    },
];
export const Default = {
    args: {
        columns,
        data,
        rowKey: (row) => row.id,
    },
};
export const Sortable = {
    args: {
        columns,
        data,
        rowKey: (row) => row.id,
        sortable: true,
    },
};
export const WithSelection = {
    args: {
        columns,
        data,
        rowKey: (row) => row.id,
        sortable: true,
        selectedRows: new Set([1, 3]),
    },
};
export const Compact = {
    args: {
        columns,
        data,
        rowKey: (row) => row.id,
        density: 'compact',
    },
};
export const Empty = {
    args: {
        columns,
        data: [],
        rowKey: (row) => row.id,
        emptyState: _jsx("div", { style: { padding: 32, textAlign: 'center', color: '#6B7280' }, children: "No students found" }),
    },
};
//# sourceMappingURL=Table.stories.js.map