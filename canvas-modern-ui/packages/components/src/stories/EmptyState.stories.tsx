import type { Meta, StoryObj } from '@storybook/react'
import { EmptyState, EmptyStates } from '../ui/empty/EmptyStates'
import React from 'react'

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof EmptyState>

export const Default: Story = {
  args: {
    title: 'No items found',
    description: 'There are no items to display at this time.',
  },
}

export const WithAction: Story = {
  args: {
    title: 'No courses',
    description: 'You are not enrolled in any courses yet.',
    action: { label: 'Browse Courses', onClick: () => {} },
  },
}

export const WithSecondaryAction: Story = {
  args: {
    title: 'No results',
    description: 'Try adjusting your search.',
    action: { label: 'Clear Filters', onClick: () => {} },
    secondaryAction: { label: 'Learn More', onClick: () => {} },
  },
}

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again.',
    action: { label: 'Retry', onClick: () => {} },
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Access denied',
    description: "You don't have permission to view this content.",
  },
}

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Under maintenance',
    description: 'This feature is temporarily unavailable.',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    title: 'No items',
    description: 'Nothing to show here.',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    title: 'Welcome!',
    description: 'Get started by exploring the available features.',
    action: { label: 'Get Started', onClick: () => {} },
  },
}

export const Presets: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <EmptyStates.NoCourses />
      <EmptyStates.NoAssignments />
      <EmptyStates.NoDiscussions />
      <EmptyStates.NoEvents />
      <EmptyStates.NoSearchResults />
      <EmptyStates.NetworkError />
      <EmptyStates.Unauthorized />
      <EmptyStates.Maintenance />
    </div>
  ),
}
