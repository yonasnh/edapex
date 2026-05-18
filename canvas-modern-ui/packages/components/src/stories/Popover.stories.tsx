import type { Meta, StoryObj } from '@storybook/react'
import { Popover } from '../ui/popover/Popover'
import React from 'react'

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Popover>

export const Bottom: Story = {
  args: {
    trigger: <button type="button">Hover me</button>,
    children: 'Popover content',
    open: true,
    placement: 'bottom',
  },
}

export const Top: Story = {
  args: {
    trigger: <button type="button">Top popover</button>,
    children: 'Content above',
    open: true,
    placement: 'top',
  },
}
