import type { Meta, StoryObj } from '@storybook/react'
import { LoadingSpinner, SkeletonCard, SkeletonTable, SkeletonList, PageLoading, InlineLoading } from '../ui/loading/LoadingStates'
import React from 'react'

const spinnerMeta: Meta<typeof LoadingSpinner> = {
  title: 'Components/LoadingStates/Spinner',
  component: LoadingSpinner,
  tags: ['autodocs'],
}
export default spinnerMeta
type SpinnerStory = StoryObj<typeof LoadingSpinner>

export const SpinnerSmall: SpinnerStory = { args: { size: 'sm' } }
export const SpinnerMedium: SpinnerStory = { args: { size: 'md' } }
export const SpinnerLarge: SpinnerStory = { args: { size: 'lg' } }

export const SpinnerWithOverlay: SpinnerStory = {
  args: { size: 'lg', withOverlay: true, description: 'Loading content...' },
  parameters: { docs: { storyDescription: 'Full-page loading overlay.' } },
}

export const SkeletonCardExample: StoryObj<typeof SkeletonCard> = {
  render: () => <SkeletonCard count={3} showAvatar showActions />,
}

export const SkeletonTableExample: StoryObj<typeof SkeletonTable> = {
  render: () => <SkeletonTable rows={5} columns={4} />,
}

export const SkeletonListExample: StoryObj<typeof SkeletonList> = {
  render: () => <SkeletonList count={4} showAvatar showMeta />,
}

export const PageLoadingExample: StoryObj<typeof PageLoading> = {
  args: {
    title: 'Loading Dashboard',
    description: 'Please wait while we prepare your dashboard.',
  },
}

export const InlineLoadingExample: StoryObj<typeof InlineLoading> = {
  args: { status: 'active', description: 'Saving changes...' },
}

export const InlineLoadingStates: StoryObj<typeof InlineLoading> = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <InlineLoading status="inactive" description="Idle" />
      <InlineLoading status="active" description="Processing..." />
      <InlineLoading status="finished" successDescription="Done" />
      <InlineLoading status="error" errorDescription="Failed" />
    </div>
  ),
}
