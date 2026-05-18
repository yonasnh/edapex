import type { Meta, StoryObj } from '@storybook/react'
import { Card } from '../ui/card/Card'
import { BarChartIcon, FileIcon, BookIcon } from '../ui/icon/Icon'
import React from 'react'

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'stat', 'interactive', 'settings', 'summary'] },
    density: { control: 'select', options: ['comfortable', 'default', 'compact'] },
  },
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  args: {
    title: 'Card Title',
    subtitle: 'A short description of this card.',
    children: 'This is the card body content. Cards can contain any content.',
  },
}

export const Stat: Story = {
  args: {
    variant: 'stat',
    icon: <BarChartIcon />,
    title: 'Total Students',
    children: '1,234',
  },
}

export const Interactive: Story = {
  args: {
    variant: 'interactive',
    title: 'Clickable Card',
    subtitle: 'This card responds to clicks and keyboard interaction.',
    children: 'Press Enter or Space to activate.',
    onClick: () => alert('Card clicked!'),
  },
}

export const Selected: Story = {
  args: {
    variant: 'interactive',
    selected: true,
    title: 'Selected Card',
    subtitle: 'This card is in selected state.',
    children: 'Uses a highlighted background and border.',
  },
}

export const Settings: Story = {
  args: {
    variant: 'settings',
    title: 'Settings Card',
    subtitle: 'Configure your preferences.',
    children: 'Settings content goes in the body.',
    footer: <button type="button">Save Changes</button>,
  },
}

export const Summary: Story = {
  args: {
    variant: 'summary',
    title: 'Summary',
    children: 'A summary card with a colored left border accent.',
  },
}

export const WithFooter: Story = {
  args: {
    title: 'Card with Footer',
    children: 'Main content area.',
    footer: (
      <>
        <button type="button">Cancel</button>
        <button type="button">Save</button>
      </>
    ),
  },
}

export const WithIcon: Story = {
  args: {
    icon: <FileIcon />,
    title: 'Files',
    subtitle: 'Course Materials',
    children: 'Access your course files and documents.',
  },
}

export const Compact: Story = {
  args: {
    density: 'compact',
    title: 'Compact Card',
    children: 'A more condensed layout for data-heavy views.',
  },
}

export const Comfortable: Story = {
  args: {
    density: 'comfortable',
    title: 'Comfortable Card',
    subtitle: 'A roomier layout for reading-focused content.',
    children: 'More padding and breathing room.',
  },
}

export const Densities: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
      <Card density="comfortable" title="Comfortable">Spacious padding for reading</Card>
      <Card density="default" title="Default">Standard density for most uses</Card>
      <Card density="compact" title="Compact">Tight layout for data tables</Card>
    </div>
  ),
}

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
      <Card title="Default Card">Basic content card</Card>
      <Card variant="stat" icon={<BookIcon />} title="Stat Card">42</Card>
      <Card variant="interactive" title="Interactive Card" onClick={() => {}}>Clickable with hover effect</Card>
      <Card variant="settings" title="Settings Card" footer={<button type="button">Apply</button>}>Editable preferences</Card>
      <Card variant="summary" title="Summary Card">Accented left border</Card>
    </div>
  ),
}
