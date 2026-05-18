import React, { useState, useCallback, type ReactNode } from 'react'
import clsx from 'clsx'
import './Table.css'

export interface Column<T = any> {
  id: string
  header: string
  accessor: (row: T) => ReactNode
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string
}

export interface TableProps<T = any> {
  columns: Column<T>[]
  data: T[]
  rowKey: (row: T) => string | number
  sortable?: boolean
  stickyHeader?: boolean
  onRowClick?: (row: T) => void
  selectedRows?: Set<string | number>
  onSelectedRowsChange?: (selected: Set<string | number>) => void
  emptyState?: ReactNode
  loading?: boolean
  density?: 'default' | 'compact'
  className?: string
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  sortable = false,
  stickyHeader = false,
  onRowClick,
  selectedRows,
  onSelectedRowsChange,
  emptyState,
  loading = false,
  density = 'default',
  className,
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = useCallback((columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnId)
      setSortDirection('asc')
    }
  }, [sortColumn])

  const handleSelectAll = useCallback(() => {
    if (selectedRows && onSelectedRowsChange) {
      if (selectedRows.size === data.length) {
        onSelectedRowsChange(new Set())
      } else {
        onSelectedRowsChange(new Set(data.map(rowKey)))
      }
    }
  }, [selectedRows, onSelectedRowsChange, data, rowKey])

  const handleRowSelect = useCallback((key: string | number) => {
    if (!selectedRows || !onSelectedRowsChange) return
    const next = new Set(selectedRows)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onSelectedRowsChange(next)
  }, [selectedRows, onSelectedRowsChange])

  const sortedData = sortColumn
    ? [...data].sort((a, b) => {
        const col = columns.find(c => c.id === sortColumn)
        if (!col) return 0
        const aVal = col.accessor(a)
        const bVal = col.accessor(b)
        const cmp = String(aVal).localeCompare(String(bVal))
        return sortDirection === 'asc' ? cmp : -cmp
      })
    : data

  if (loading) {
    return (
      <div className={clsx('cm-table', `cm-table--${density}`, className)} aria-busy="true">
        <div className="cm-table__skeleton">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="cm-table__skeleton-row" style={{ width: `${85 + Math.random() * 15}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={clsx('cm-table', className)}>
        {emptyState || (
          <div className="cm-table__empty">
            <p>No data available</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={clsx('cm-table', `cm-table--${density}`, className)}>
      <table className={clsx(stickyHeader && 'cm-table--sticky')}>
        <thead>
          <tr>
            {selectedRows && (
              <th className="cm-table__cell cm-table__cell--checkbox">
                <input
                  type="checkbox"
                  checked={selectedRows.size === data.length && data.length > 0}
                  onChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map(col => (
              <th
                key={col.id}
                className={clsx(
                  'cm-table__cell cm-table__cell--header',
                  col.sortable && sortable && 'cm-table__cell--sortable',
                  col.align && `cm-table__cell--${col.align}`,
                )}
                style={col.width ? { width: col.width } : undefined}
                onClick={() => {
                  if (col.sortable && sortable) handleSort(col.id)
                }}
                aria-sort={
                  sortColumn === col.id
                    ? sortDirection === 'asc' ? 'ascending' : 'descending'
                    : undefined
                }
                tabIndex={col.sortable && sortable ? 0 : undefined}
                onKeyDown={e => {
                  if ((e.key === 'Enter' || e.key === ' ') && col.sortable && sortable) {
                    e.preventDefault()
                    handleSort(col.id)
                  }
                }}
              >
                {col.header}
                {sortColumn === col.id && (
                  <span className="cm-table__sort-icon" aria-hidden="true">
                    {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map(row => {
            const key = rowKey(row)
            const isSelected = selectedRows?.has(key)

            return (
              <tr
                key={key}
                className={clsx(
                  'cm-table__row',
                  isSelected && 'cm-table__row--selected',
                  onRowClick && 'cm-table__row--clickable',
                )}
                onClick={() => onRowClick?.(row)}
                aria-selected={isSelected || undefined}
              >
                {selectedRows && (
                  <td className="cm-table__cell cm-table__cell--checkbox">
                    <input
                      type="checkbox"
                      checked={isSelected ?? false}
                      onChange={() => handleRowSelect(key)}
                      aria-label={`Select row ${key}`}
                    />
                  </td>
                )}
                {columns.map(col => (
                  <td
                    key={col.id}
                    className={clsx(
                      'cm-table__cell',
                      col.align && `cm-table__cell--${col.align}`,
                    )}
                  >
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

Table.displayName = 'Table'
