import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  confirmMessage?: string;
  onClick: (selectedIds: string[]) => void | Promise<void>;
}

export interface BulkOperationsBarProps<T> {
  items: T[];
  selectedIds: string[];
  onSelectAll: () => void;
  onSelectNone: () => void;
  actions: BulkAction[];
  itemName?: string;
}

export default function BulkOperationsBar<T>({
  items,
  selectedIds,
  onSelectAll,
  onSelectNone,
  actions,
  itemName = 'items',
}: BulkOperationsBarProps<T>) {
  const count = selectedIds.length;
  const allSelected = count > 0 && count === items.length;

  const handleActionClick = useCallback(
    async (action: BulkAction) => {
      if (action.confirmMessage && !window.confirm(action.confirmMessage)) {
        return;
      }
      await action.onClick(selectedIds);
    },
    [selectedIds]
  );

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          key="bulk-bar"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bulk-operations-bar"
          style={{
            position: 'sticky',
            bottom: 'var(--spacing-04)',
            marginTop: 'var(--spacing-04)',
            background: 'var(--cx-bg-surface-raised)',
            border: '1px solid var(--cx-border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-04) var(--spacing-05)',
            boxShadow: 'var(--shadow-03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--spacing-04)',
            flexWrap: 'wrap',
            zIndex: 50,
          }}
          role="toolbar"
          aria-label="Bulk operations"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-04)',
              flexWrap: 'wrap',
            }}
          >
            <span
              aria-live="polite"
              aria-atomic="true"
              style={{ fontWeight: 600, color: 'var(--cx-text-primary)', fontSize: '0.875rem' }}
            >
              {count} {itemName} selected
            </span>
            <div style={{ display: 'flex', gap: 'var(--spacing-02)' }}>
              {!allSelected ? (
                <button
                  type="button"
                  className="cx-btn cx-btn--ghost cx-btn--sm"
                  onClick={onSelectAll}
                >
                  Select All
                </button>
              ) : (
                <button
                  type="button"
                  className="cx-btn cx-btn--ghost cx-btn--sm"
                  onClick={onSelectNone}
                >
                  Select None
                </button>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-03)',
              flexWrap: 'wrap',
            }}
          >
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                className={clsx(
                  'cx-btn',
                  action.variant === 'danger'
                    ? 'cx-btn--danger'
                    : action.variant === 'secondary'
                    ? 'cx-btn--secondary'
                    : 'cx-btn--primary'
                )}
                onClick={() => handleActionClick(action)}
                title={action.label}
              >
                {action.icon && (
                  <span style={{ display: 'inline-flex', marginRight: 4 }}>
                    {action.icon}
                  </span>
                )}
                {action.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
