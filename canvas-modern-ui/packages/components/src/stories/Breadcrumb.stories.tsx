import type { Meta, StoryObj } from '@storybook/react'
import { Breadcrumb } from '../navigation/Breadcrumb'
import { HomeIcon, FileIcon, BookIcon } from '../ui/icon/Icon'
import React from 'react'

const meta: Meta<typeof Breadcrumb> = {
  title: 'Navigation/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  argTypes: {
    maxItems: { control: { type: 'number', min: 2, max: 10 } },
  },
}

export default meta
type Story = StoryObj<typeof Breadcrumb>

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Mathematics 101', href: '/courses/101' },
    ],
  },
}

export const TwoLevels: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Settings', href: '/settings' },
    ],
  },
}

export const WithAutoGeneration: Story = {
  args: {
    pathname: '/courses/101/assignments/42',
    maxItems: 4,
  },
}

export const Collapsed: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Computer Science', href: '/courses/42' },
      { label: 'Assignments', href: '/courses/42/assignments' },
      { label: 'Project 3', href: '/courses/42/assignments/7' },
    ],
    maxItems: 3,
  },
}

export const WithIcons: Story = {
  args: {
    items: [
      { label: 'Home', href: '/', icon: <HomeIcon size={14} /> },
      { label: 'Files', href: '/files', icon: <FileIcon size={14} /> },
      { label: 'Documents', icon: <BookIcon size={14} /> },
    ],
  },
}

export const DeepPath: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Breadcrumb pathname="/dashboard" />
      <Breadcrumb pathname="/courses/42/assignments/15" />
      <Breadcrumb pathname="/admin/users/roles/permissions" />
    </div>
  ),
}
