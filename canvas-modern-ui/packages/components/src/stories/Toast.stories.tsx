import type { Meta, StoryObj } from '@storybook/react'
import { Toast } from '../ui/alert/Alert'
import React from 'react'

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['info', 'success', 'warning', 'danger'] },
    duration: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof Toast>

export const Info: Story = {
  args: { variant: 'info', children: 'This is an informational message.', duration: 0 },
}

export const Success: Story = {
  args: { variant: 'success', children: 'Your changes have been saved.', duration: 0 },
}

export const Warning: Story = {
  args: { variant: 'warning', children: 'Your session will expire soon.', duration: 0 },
}

export const Danger: Story = {
  args: { variant: 'danger', children: 'An error occurred while saving.', duration: 0 },
}

export const WithTitle: Story = {
  args: { variant: 'info', title: 'Heads up', children: 'This is a toast with a title.', duration: 0 },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}>
      <Toast variant="info" duration={0}>This is an informational message.</Toast>
      <Toast variant="success" duration={0}>Your changes have been saved successfully.</Toast>
      <Toast variant="warning" duration={0}>Your session will expire in 2 minutes.</Toast>
      <Toast variant="danger" duration={0}>An error occurred while saving your changes.</Toast>
    </div>
  ),
}
