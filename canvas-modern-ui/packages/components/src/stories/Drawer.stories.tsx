import type { Meta, StoryObj } from '@storybook/react'
import { Drawer } from '../ui/drawer/Drawer'
import React from 'react'

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Drawer>

export const Right: Story = {
  args: { isOpen: true, onClose: () => {}, title: 'Drawer Title', children: 'Drawer content goes here.', side: 'right' },
}

export const Left: Story = {
  args: { isOpen: true, onClose: () => {}, title: 'Left Drawer', children: 'Content on the left side.', side: 'left' },
}

export const WithContent: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Course Details',
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p>Course information and settings can be edited here.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button">Save</button>
          <button type="button">Cancel</button>
        </div>
      </div>
    ),
  },
}
