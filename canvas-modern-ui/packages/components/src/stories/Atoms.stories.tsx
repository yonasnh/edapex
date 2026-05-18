import type { Meta, StoryObj } from '@storybook/react'
import { Avatar, Badge, Modal } from '../ui/atoms/Atoms'
import React from 'react'

const avatarMeta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
}
export default avatarMeta
type AvatarStory = StoryObj<typeof Avatar>

export const AvatarDefault: AvatarStory = { args: { name: 'John Doe', size: 'md' } }

export const AvatarWithImage: AvatarStory = {
  args: { name: 'Jane Smith', src: 'https://i.pravatar.cc/80?u=jane', size: 'lg' },
}

export const AvatarSizes: AvatarStory = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Avatar name="XS" size="xs" />
      <Avatar name="Small" size="sm" />
      <Avatar name="Medium" size="md" />
      <Avatar name="Large" size="lg" />
      <Avatar name="XL" size="xl" />
    </div>
  ),
}

export const AvatarWithStatus: AvatarStory = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Avatar name="Alice" status="online" />
      <Avatar name="Bob" status="away" />
      <Avatar name="Charlie" status="offline" />
    </div>
  ),
}

export const AvatarColors: AvatarStory = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'].map(name => (
        <Avatar key={name} name={name} />
      ))}
    </div>
  ),
}

const badgeMeta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
}
export const BadgeDefault: StoryObj<typeof Badge> = {
  render: () => <Badge>Default</Badge>,
}

export const BadgeVariants: StoryObj<typeof Badge> = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
}

export const BadgeDot: StoryObj<typeof Badge> = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Badge variant="success" dot>Online</Badge>
      <Badge variant="warning" dot>Away</Badge>
      <Badge variant="danger" dot>Offline</Badge>
    </div>
  ),
}

export const BadgeCount: StoryObj<typeof Badge> = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Badge count={3} variant="danger" />
      <Badge count={25} variant="primary" />
      <Badge count={100} variant="warning" />
    </div>
  ),
}

const modalMeta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
}
export const ModalDefault: StoryObj<typeof Modal> = {
  args: {
    isOpen: true,
    title: 'Modal Title',
    children: 'This is a basic modal with default size.',
    onClose: () => {},
  },
}

export const ModalWithFooter: StoryObj<typeof Modal> = {
  args: {
    isOpen: true,
    title: 'Confirm Action',
    children: 'Are you sure you want to proceed?',
    footer: <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
      <button type="button">Cancel</button>
      <button type="button" style={{ background: '#2563EB', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8 }}>Confirm</button>
    </div>,
    onClose: () => {},
  },
}

export const ModalSizes: StoryObj<typeof Modal> = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
      <Modal isOpen={true} title="Small" size="sm" onClose={() => {}}>Small modal content</Modal>
    </div>
  ),
}
