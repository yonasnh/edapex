import React, { memo, useState, useCallback, useMemo } from 'react'
import { 
  Button, 
  Checkbox, 
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableSelectAll,
  TableSelectRow,
  Modal,
  ProgressBar,
  InlineNotification
} from '@carbon/react'
import { 
  TrashCan,
  Download,
  Edit,
  Email,
  Archive,
  Restart,
  CheckmarkFilled
} from '@carbon/icons-react'
import clsx from 'clsx'

/**
 * Bulk operation types
 */
export type BulkOperationType = 
  | 'delete'
  | 'archive'
  | 'download'
  | 'edit'
  | 'email'
  | 'grade'
  | 'publish'
  | 'unpublish'

/**
 * Bulk operation configuration
 */
interface BulkOperation {
  id: BulkOperationType
  label: string
  icon: React.ComponentType<any>
  description: string
  confirmationRequired: boolean
  destructive: boolean
  requiresInput?: boolean
  inputType?: 'text' | 'number' | 'select' | 'textarea'
  inputOptions?: Array<{ value: string; label: string }>
}

/**
 * Bulk operations component props
 */
interface BulkOperationsProps<T> {
  items: T[]
  selectedItems: T[]
  onSelectionChange: (selectedItems: T[]) => void
  operations: BulkOperation[]
  onExecuteOperation: (
    operation: BulkOperationType,
    items: T[],
    input?: any
  ) => Promise<void>
  getItemId: (item: T) => string
  getItemLabel: (item: T) => string
  renderItem?: (item: T) => React.ReactNode
  className?: string
  'data-testid'?: string
}

/**
 * Bulk Operations Component
 * 
 * Provides bulk operation capabilities for lists of items with progress tracking,
 * confirmation dialogs, and error handling.
 */
export const BulkOperations = memo<BulkOperationsProps<any>>(
  ({
    items,
    selectedItems,
    onSelectionChange,
    operations,
    onExecuteOperation,
    getItemId,
    getItemLabel,
    renderItem,
    className,
    'data-testid': testId,
  }) => {
    const [isExecuting, setIsExecuting] = useState(false)
    const [currentOperation, setCurrentOperation] = useState<BulkOperation | null>(null)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [operationInput, setOperationInput] = useState<any>('')
    const [progress, setProgress] = useState(0)
    const [errors, setErrors] = useState<string[]>([])
    const [completed, setCompleted] = useState<string[]>([])

    const selectedItemIds = useMemo(
      () => selectedItems.map(getItemId),
      [selectedItems, getItemId]
    )

    const allSelected = useMemo(
      () => items.length > 0 && selectedItems.length === items.length,
      [items.length, selectedItems.length]
    )

    const someSelected = useMemo(
      () => selectedItems.length > 0 && selectedItems.length < items.length,
      [selectedItems.length, items.length]
    )

    /**
     * Handle select all toggle
     */
    const handleSelectAll = useCallback(() => {
      if (allSelected) {
        onSelectionChange([])
      } else {
        onSelectionChange([...items])
      }
    }, [allSelected, items, onSelectionChange])

    /**
     * Handle individual item selection
     */
    const handleItemSelect = useCallback((item: any, checked: boolean) => {
      if (checked) {
        onSelectionChange([...selectedItems, item])
      } else {
        onSelectionChange(selectedItems.filter(selected => getItemId(selected) !== getItemId(item)))
      }
    }, [selectedItems, onSelectionChange, getItemId])

    /**
     * Start bulk operation
     */
    const handleStartOperation = useCallback((operation: BulkOperation) => {
      setCurrentOperation(operation)
      setOperationInput('')
      setErrors([])
      setCompleted([])
      setProgress(0)

      if (operation.confirmationRequired) {
        setShowConfirmation(true)
      } else {
        executeOperation(operation)
      }
    }, [])

    /**
     * Execute bulk operation
     */
    const executeOperation = useCallback(async (operation: BulkOperation) => {
      if (selectedItems.length === 0) return

      setIsExecuting(true)
      setShowConfirmation(false)
      setErrors([])
      setCompleted([])
      setProgress(0)

      try {
        // Execute operation with progress tracking
        const total = selectedItems.length
        const batchSize = Math.min(10, total) // Process in batches of 10
        const batches = []

        for (let i = 0; i < total; i += batchSize) {
          batches.push(selectedItems.slice(i, i + batchSize))
        }

        let processedCount = 0

        for (const batch of batches) {
          try {
            await onExecuteOperation(operation.id, batch, operationInput)
            
            // Update progress
            processedCount += batch.length
            setProgress((processedCount / total) * 100)
            setCompleted(prev => [...prev, ...batch.map(getItemId)])
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Operation failed'
            setErrors(prev => [...prev, `Batch failed: ${errorMessage}`])
          }
        }

        // Clear selection after successful operation
        if (errors.length === 0) {
          onSelectionChange([])
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Operation failed'
        setErrors([errorMessage])
      } finally {
        setIsExecuting(false)
        setCurrentOperation(null)
      }
    }, [selectedItems, operationInput, onExecuteOperation, getItemId, onSelectionChange, errors.length])

    /**
     * Cancel operation
     */
    const handleCancel = useCallback(() => {
      setShowConfirmation(false)
      setCurrentOperation(null)
      setOperationInput('')
    }, [])

    /**
     * Render operation input
     */
    const renderOperationInput = () => {
      if (!currentOperation?.requiresInput) return null

      switch (currentOperation.inputType) {
        case 'select':
          return (
            <select
              value={operationInput}
              onChange={(e) => setOperationInput(e.target.value)}
              className="bulk-operations__input"
            >
              <option value="">Select an option</option>
              {currentOperation.inputOptions?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )
        case 'textarea':
          return (
            <textarea
              value={operationInput}
              onChange={(e) => setOperationInput(e.target.value)}
              placeholder="Enter your message..."
              className="bulk-operations__input bulk-operations__textarea"
              rows={4}
            />
          )
        case 'number':
          return (
            <input
              type="number"
              value={operationInput}
              onChange={(e) => setOperationInput(e.target.value)}
              placeholder="Enter a number..."
              className="bulk-operations__input"
            />
          )
        default:
          return (
            <input
              type="text"
              value={operationInput}
              onChange={(e) => setOperationInput(e.target.value)}
              placeholder="Enter value..."
              className="bulk-operations__input"
            />
          )
      }
    }

    return (
      <div
        className={clsx('bulk-operations', className)}
        data-testid={testId}
      >
        {/* Selection Controls */}
        <div className="bulk-operations__controls">
          <div className="bulk-operations__selection">
            <Checkbox
              id="select-all"
              labelText={`Select all (${items.length} items)`}
              checked={allSelected}
              indeterminate={someSelected}
              onChange={handleSelectAll}
            />
            
            {selectedItems.length > 0 && (
              <span className="bulk-operations__selection-count">
                {selectedItems.length} of {items.length} selected
              </span>
            )}
          </div>

          {/* Operation Buttons */}
          {selectedItems.length > 0 && (
            <div className="bulk-operations__actions">
              {operations.map(operation => (
                <Button
                  key={operation.id}
                  kind={operation.destructive ? 'danger' : 'secondary'}
                  size="sm"
                  renderIcon={operation.icon}
                  onClick={() => handleStartOperation(operation)}
                  disabled={isExecuting}
                >
                  {operation.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        {isExecuting && (
          <div className="bulk-operations__progress">
            <div className="bulk-operations__progress-header">
              <span>
                Executing {currentOperation?.label} on {selectedItems.length} items...
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <ProgressBar value={progress} label={`${Math.round(progress)}%`} />
          </div>
        )}

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bulk-operations__errors">
            {errors.map((error, index) => (
              <InlineNotification
                key={index}
                kind="error"
                title="Operation Error"
                subtitle={error}
                hideCloseButton
                lowContrast
              />
            ))}
          </div>
        )}

        {/* Success Message */}
        {completed.length > 0 && !isExecuting && (
          <InlineNotification
            kind="success"
            title="Operation Completed"
            subtitle={`Successfully processed ${completed.length} items`}
            hideCloseButton
            lowContrast
          />
        )}

        {/* Items List */}
        <div className="bulk-operations__items">
          {items.map(item => {
            const itemId = getItemId(item)
            const isSelected = selectedItemIds.includes(itemId)
            const isCompleted = completed.includes(itemId)

            return (
              <div
                key={itemId}
                className={clsx('bulk-operations__item', {
                  'bulk-operations__item--selected': isSelected,
                  'bulk-operations__item--completed': isCompleted,
                })}
              >
                <Checkbox
                  id={`item-${itemId}`}
                  labelText=""
                  checked={isSelected}
                  onChange={(evt, data) => handleItemSelect(item, data.checked)}
                  disabled={isExecuting}
                />
                
                <div className="bulk-operations__item-content">
                  {renderItem ? renderItem(item) : (
                    <span className="bulk-operations__item-label">
                      {getItemLabel(item)}
                    </span>
                  )}
                </div>

                {isCompleted && (
                  <div className="bulk-operations__item-status">
                    <CheckmarkFilled size={16} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Confirmation Modal */}
        <Modal
          open={showConfirmation}
          onRequestClose={handleCancel}
          modalHeading={`Confirm ${currentOperation?.label}`}
          primaryButtonText="Execute"
          secondaryButtonText="Cancel"
          danger={currentOperation?.destructive}
          onRequestSubmit={() => currentOperation && executeOperation(currentOperation)}
          onSecondarySubmit={handleCancel}
        >
          <div className="bulk-operations__confirmation">
            <p>
              Are you sure you want to {currentOperation?.label.toLowerCase()} {selectedItems.length} items?
            </p>
            
            {currentOperation?.description && (
              <p className="bulk-operations__description">
                {currentOperation.description}
              </p>
            )}

            {renderOperationInput()}

            {currentOperation?.destructive && (
              <InlineNotification
                kind="warning"
                title="Warning"
                subtitle="This action cannot be undone."
                hideCloseButton
                lowContrast
              />
            )}
          </div>
        </Modal>
      </div>
    )
  }
)

BulkOperations.displayName = 'BulkOperations'

/**
 * Common bulk operations for different content types
 */
export const commonBulkOperations = {
  assignments: [
    {
      id: 'delete' as BulkOperationType,
      label: 'Delete',
      icon: TrashCan,
      description: 'Permanently delete selected assignments.',
      confirmationRequired: true,
      destructive: true,
    },
    {
      id: 'download' as BulkOperationType,
      label: 'Download',
      icon: Download,
      description: 'Download selected assignments as a ZIP file.',
      confirmationRequired: false,
      destructive: false,
    },
    {
      id: 'grade' as BulkOperationType,
      label: 'Bulk Grade',
      icon: Edit,
      description: 'Apply the same grade to all selected assignments.',
      confirmationRequired: true,
      destructive: false,
      requiresInput: true,
      inputType: 'number' as const,
    },
  ],
  students: [
    {
      id: 'email' as BulkOperationType,
      label: 'Send Email',
      icon: Email,
      description: 'Send an email to selected students.',
      confirmationRequired: true,
      destructive: false,
      requiresInput: true,
      inputType: 'textarea' as const,
    },
    {
      id: 'archive' as BulkOperationType,
      label: 'Archive',
      icon: Archive,
      description: 'Archive selected student records.',
      confirmationRequired: true,
      destructive: false,
    },
  ],
  files: [
    {
      id: 'delete' as BulkOperationType,
      label: 'Delete',
      icon: TrashCan,
      description: 'Permanently delete selected files.',
      confirmationRequired: true,
      destructive: true,
    },
    {
      id: 'download' as BulkOperationType,
      label: 'Download',
      icon: Download,
      description: 'Download selected files as a ZIP archive.',
      confirmationRequired: false,
      destructive: false,
    },
  ],
}
