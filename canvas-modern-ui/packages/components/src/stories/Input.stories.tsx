import type { Meta, StoryObj } from '@storybook/react'
import { Input, Textarea, Select, Checkbox, Radio, Switch } from '../ui/atoms/Atoms'

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    error: { control: 'text' },
    hint: { control: 'text' },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Input>

export const DefaultInput: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
  },
}

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    error: 'Please enter a valid email address',
    value: 'invalid',
  },
}

export const WithHint: Story = {
  args: {
    label: 'Password',
    type: 'password',
    hint: 'Must be at least 8 characters',
  },
}

export const WithIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  },
}

export const TextareaExample: Story = {
  render: () => (
    <Textarea label="Description" placeholder="Enter a description..." rows={4} />
  ),
}

export const SelectExample: Story = {
  render: () => (
    <Select
      label="Role"
      options={[
        { value: 'student', label: 'Student' },
        { value: 'teacher', label: 'Teacher' },
        { value: 'admin', label: 'Administrator' },
      ]}
      placeholder="Select a role..."
    />
  ),
}

export const CheckboxExample: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Checkbox label="Option A" />
      <Checkbox label="Option B" />
      <Checkbox label="Option C (disabled)" disabled />
    </div>
  ),
}

export const RadioExample: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Radio name="choice" value="a" label="Choice A" />
      <Radio name="choice" value="b" label="Choice B" />
      <Radio name="choice" value="c" label="Choice C" />
    </div>
  ),
}

export const SwitchExample: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Switch label="Enable notifications" />
      <Switch label="Dark mode" />
      <Switch label="Disabled option" disabled />
    </div>
  ),
}
