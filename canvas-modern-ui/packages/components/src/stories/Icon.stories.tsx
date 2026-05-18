import type { Meta, StoryObj } from '@storybook/react'
import * as Icons from '../ui/icon/Icon'
import React from 'react'

const meta: Meta = {
  title: 'Components/Icon',
  tags: ['autodocs'],
}

export default meta

export const AllIcons: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
      <Icons.SearchIcon size={24} />
      <Icons.CloseIcon size={24} />
      <Icons.ChevronLeftIcon size={24} />
      <Icons.ChevronRightIcon size={24} />
      <Icons.ChevronUpIcon size={24} />
      <Icons.ChevronDownIcon size={24} />
      <Icons.CheckIcon size={24} />
      <Icons.AlertCircleIcon size={24} />
      <Icons.InfoIcon size={24} />
      <Icons.WarningIcon size={24} />
      <Icons.EyeIcon size={24} />
      <Icons.EyeOffIcon size={24} />
      <Icons.MenuIcon size={24} />
      <Icons.SettingsIcon size={24} />
      <Icons.HomeIcon size={24} />
      <Icons.BellIcon size={24} />
      <Icons.BookIcon size={24} />
      <Icons.UserIcon size={24} />
      <Icons.FileIcon size={24} />
      <Icons.EditIcon size={24} />
      <Icons.ChatIcon size={24} />
      <Icons.CheckCircleIcon size={24} />
      <Icons.AlertTriangleIcon size={24} />
      <Icons.MegaphoneIcon size={24} />
      <Icons.MailIcon size={24} />
      <Icons.StarIcon size={24} />
      <Icons.CalendarIcon size={24} />
      <Icons.BarChartIcon size={24} />
      <Icons.GridIcon size={24} />
      <Icons.ListIcon size={24} />
    </div>
  ),
}

export const Sizes: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Icons.SearchIcon size={16} />
      <Icons.SearchIcon size={20} />
      <Icons.SearchIcon size={24} />
    </div>
  ),
}

export const Colored: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Icons.CheckIcon size={24} style={{ color: '#15803D' }} />
      <Icons.WarningIcon size={24} style={{ color: '#B45309' }} />
      <Icons.AlertCircleIcon size={24} style={{ color: '#B91C1C' }} />
      <Icons.InfoIcon size={24} style={{ color: '#2563EB' }} />
    </div>
  ),
}
