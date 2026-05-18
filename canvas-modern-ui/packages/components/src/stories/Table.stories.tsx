import type { Meta, StoryObj } from '@storybook/react'
import { Table } from '../ui/table/Table'
import { Badge } from '../ui/atoms/Atoms'

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Table>

interface Student {
  id: number
  name: string
  email: string
  grade: string
  status: string
}

const data: Student[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', grade: 'A', status: 'active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', grade: 'B+', status: 'active' },
  { id: 3, name: 'Carol Davis', email: 'carol@example.com', grade: 'A-', status: 'active' },
  { id: 4, name: 'David Wilson', email: 'david@example.com', grade: 'C', status: 'inactive' },
  { id: 5, name: 'Eve Martinez', email: 'eve@example.com', grade: 'B', status: 'active' },
]

const columns = [
  { id: 'name', header: 'Name', accessor: (row: Student) => row.name, sortable: true },
  { id: 'email', header: 'Email', accessor: (row: Student) => row.email, sortable: true },
  { id: 'grade', header: 'Grade', accessor: (row: Student) => <strong>{row.grade}</strong>, sortable: true },
  {
    id: 'status',
    header: 'Status',
    accessor: (row: Student) => (
      <Badge variant={row.status === 'active' ? 'success' : 'default'} size="sm">
        {row.status}
      </Badge>
    ),
  },
]

export const Default: Story = {
  args: {
    columns,
    data,
    rowKey: (row: Student) => row.id,
  },
}

export const Sortable: Story = {
  args: {
    columns,
    data,
    rowKey: (row: Student) => row.id,
    sortable: true,
  },
}

export const WithSelection: Story = {
  args: {
    columns,
    data,
    rowKey: (row: Student) => row.id,
    sortable: true,
    selectedRows: new Set([1, 3]),
  },
}

export const Compact: Story = {
  args: {
    columns,
    data,
    rowKey: (row: Student) => row.id,
    density: 'compact',
  },
}

export const Empty: Story = {
  args: {
    columns,
    data: [],
    rowKey: (row: Student) => row.id,
    emptyState: <div style={{ padding: 32, textAlign: 'center', color: '#6B7280' }}>No students found</div>,
  },
}
