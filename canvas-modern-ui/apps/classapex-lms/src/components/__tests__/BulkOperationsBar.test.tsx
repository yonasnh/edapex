import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import BulkOperationsBar from '../BulkOperationsBar'

describe('BulkOperationsBar', () => {
  const items = [
    { id: '1', name: 'Item A' },
    { id: '2', name: 'Item B' },
    { id: '3', name: 'Item C' },
  ]

  it('renders nothing when no items selected', () => {
    const { container } = render(
      <BulkOperationsBar
        items={items}
        selectedIds={[]}
        onSelectAll={vi.fn()}
        onSelectNone={vi.fn()}
        actions={[]}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders bar with count when items selected', () => {
    render(
      <BulkOperationsBar
        items={items}
        selectedIds={['1', '2']}
        onSelectAll={vi.fn()}
        onSelectNone={vi.fn()}
        actions={[]}
      />
    )

    expect(screen.getByText('2 items selected')).toBeInTheDocument()
  })

  it('shows "Select All" when not all selected', () => {
    render(
      <BulkOperationsBar
        items={items}
        selectedIds={['1']}
        onSelectAll={vi.fn()}
        onSelectNone={vi.fn()}
        actions={[]}
      />
    )

    expect(screen.getByRole('button', { name: 'Select All' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Select None' })).not.toBeInTheDocument()
  })

  it('shows "Select None" when all selected', () => {
    render(
      <BulkOperationsBar
        items={items}
        selectedIds={['1', '2', '3']}
        onSelectAll={vi.fn()}
        onSelectNone={vi.fn()}
        actions={[]}
      />
    )

    expect(screen.getByRole('button', { name: 'Select None' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Select All' })).not.toBeInTheDocument()
  })

  it('calls onSelectAll when clicked', () => {
    const onSelectAll = vi.fn()

    render(
      <BulkOperationsBar
        items={items}
        selectedIds={['1']}
        onSelectAll={onSelectAll}
        onSelectNone={vi.fn()}
        actions={[]}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Select All' }))
    expect(onSelectAll).toHaveBeenCalled()
  })

  it('calls onSelectNone when clicked', () => {
    const onSelectNone = vi.fn()

    render(
      <BulkOperationsBar
        items={items}
        selectedIds={['1', '2', '3']}
        onSelectAll={vi.fn()}
        onSelectNone={onSelectNone}
        actions={[]}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Select None' }))
    expect(onSelectNone).toHaveBeenCalled()
  })

  it('renders action buttons', () => {
    const actions = [
      { id: 'delete', label: 'Delete', variant: 'danger' as const, onClick: vi.fn() },
      { id: 'export', label: 'Export', variant: 'secondary' as const, onClick: vi.fn() },
    ]

    render(
      <BulkOperationsBar
        items={items}
        selectedIds={['1']}
        onSelectAll={vi.fn()}
        onSelectNone={vi.fn()}
        actions={actions}
      />
    )

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
  })

  it('calls action onClick with selectedIds', () => {
    const onDelete = vi.fn()
    const actions = [
      { id: 'delete', label: 'Delete', variant: 'danger' as const, onClick: onDelete },
    ]

    render(
      <BulkOperationsBar
        items={items}
        selectedIds={['1', '3']}
        onSelectAll={vi.fn()}
        onSelectNone={vi.fn()}
        actions={actions}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith(['1', '3'])
  })

  it('shows confirm dialog when action has confirmMessage', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const onDelete = vi.fn()
    const actions = [
      { id: 'delete', label: 'Delete', confirmMessage: 'Are you sure?', variant: 'danger' as const, onClick: onDelete },
    ]

    render(
      <BulkOperationsBar
        items={items}
        selectedIds={['1']}
        onSelectAll={vi.fn()}
        onSelectNone={vi.fn()}
        actions={actions}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure?')
    expect(onDelete).toHaveBeenCalled()

    confirmSpy.mockRestore()
  })

  it('does not call action if confirm is cancelled', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const onDelete = vi.fn()
    const actions = [
      { id: 'delete', label: 'Delete', confirmMessage: 'Are you sure?', variant: 'danger' as const, onClick: onDelete },
    ]

    render(
      <BulkOperationsBar
        items={items}
        selectedIds={['1']}
        onSelectAll={vi.fn()}
        onSelectNone={vi.fn()}
        actions={actions}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure?')
    expect(onDelete).not.toHaveBeenCalled()

    confirmSpy.mockRestore()
  })
})
