import type { Meta, StoryObj } from '@storybook/react'
import { ProgressBar } from '../ui/progress/ProgressBar'
import React from 'react'

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ProgressBar>

export const Default: Story = { args: { value: 45, showLabel: true } }
export const Success: Story = { args: { value: 80, variant: 'success', showLabel: true } }
export const Warning: Story = { args: { value: 55, variant: 'warning', showLabel: true } }
export const Danger: Story = { args: { value: 25, variant: 'danger', showLabel: true } }
export const Indeterminate: Story = { args: { indeterminate: true } }
export const Small: Story = { args: { value: 60, size: 'sm' } }

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
      <ProgressBar value={90} variant="success" showLabel />
      <ProgressBar value={50} variant="warning" showLabel />
      <ProgressBar value={20} variant="danger" showLabel />
      <ProgressBar value={60} showLabel />
    </div>
  ),
}
