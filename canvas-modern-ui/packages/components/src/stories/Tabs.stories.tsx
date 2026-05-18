import type { Meta, StoryObj } from '@storybook/react'
import { Tabs } from '../ui/tabs/Tabs'
import { Button } from '../ui/button/Button'

const meta: Meta<typeof Tabs> = {
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
}

export default meta
type Story = StoryObj<typeof Tabs>

const sampleTabs = [
  { id: 'overview', label: 'Overview', content: <div style={{ padding: '16px 0' }}>Overview content with details about this section.</div> },
  { id: 'submissions', label: 'Submissions', content: <div style={{ padding: '16px 0' }}>View and grade student submissions.</div> },
  { id: 'grades', label: 'Grades', content: <div style={{ padding: '16px 0' }}>Grade summary and analytics.</div> },
  { id: 'comments', label: 'Comments', badge: 3, content: <div style={{ padding: '16px 0' }}>Discussion and feedback.</div> },
]

export const Underline: Story = {
  args: {
    tabs: sampleTabs,
    variant: 'underline',
  },
}

export const Pills: Story = {
  args: {
    tabs: sampleTabs,
    variant: 'pills',
  },
}

export const WithDisabledTab: Story = {
  args: {
    tabs: [
      ...sampleTabs.slice(0, 2),
      { id: 'disabled', label: 'Disabled', disabled: true, content: null },
      sampleTabs[3],
    ],
  },
}
