import type { Meta, StoryObj } from '@storybook/react'
import { Alert } from '../ui/alert/Alert'

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'danger'],
    },
    dismissible: { control: 'boolean' },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Alert>

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'This is an informational alert.',
    title: 'Information',
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Your changes have been saved successfully.',
    title: 'Success',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Please review your submission before continuing.',
    title: 'Warning',
  },
}

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'There was an error processing your request.',
    title: 'Error',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Alert variant="info" title="Info">Informational message here.</Alert>
      <Alert variant="success" title="Success">Operation completed.</Alert>
      <Alert variant="warning" title="Warning">Check your input.</Alert>
      <Alert variant="danger" title="Error">Something went wrong.</Alert>
    </div>
  ),
}

export const Dismissible: Story = {
  args: {
    variant: 'info',
    title: 'Dismissible Alert',
    children: 'You can dismiss this alert by clicking the close button.',
    dismissible: true,
  },
}
