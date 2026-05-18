import React, { useState, useCallback, type ReactNode } from 'react'
import clsx from 'clsx'
import './Tabs.css'

export interface Tab {
  id: string
  label: string
  content?: ReactNode
  icon?: ReactNode
  badge?: number
  disabled?: boolean
}

export interface TabsProps {
  tabs: Tab[]
  activeId?: string
  onChange?: (id: string) => void
  variant?: 'underline' | 'pills'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  'aria-label'?: string
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeId: controlledActiveId,
  onChange,
  variant = 'underline',
  size = 'md',
  className,
  'aria-label': ariaLabel = 'Tabs',
}) => {
  const [internalActiveId, setInternalActiveId] = useState<string>(tabs[0]?.id ?? '')

  const isControlled = controlledActiveId !== undefined
  const activeId = isControlled ? controlledActiveId : internalActiveId

  const handleTabClick = useCallback((tabId: string) => {
    if (!isControlled) setInternalActiveId(tabId)
    onChange?.(tabId)
  }, [isControlled, onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    let newIndex = index
    if (e.key === 'ArrowRight') newIndex = (index + 1) % tabs.length
    else if (e.key === 'ArrowLeft') newIndex = (index - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') newIndex = 0
    else if (e.key === 'End') newIndex = tabs.length - 1
    else return

    e.preventDefault()
    const target = tabs[newIndex]
    if (target && !target.disabled) handleTabClick(target.id)
  }, [tabs, handleTabClick])

  const activeTab = tabs.find(t => t.id === activeId)

  return (
    <div className={clsx('cm-tabs', `cm-tabs--${variant}`, `cm-tabs--${size}`, className)}>
      <div className="cm-tabs__list" role="tablist" aria-label={ariaLabel}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            id={`cm-tab-${tab.id}`}
            className={clsx('cm-tabs__tab', {
              'cm-tabs__tab--active': activeId === tab.id,
              'cm-tabs__tab--disabled': tab.disabled,
            })}
            onClick={() => handleTabClick(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            aria-selected={activeId === tab.id}
            aria-controls={`cm-tabpanel-${tab.id}`}
            disabled={tab.disabled}
            tabIndex={activeId === tab.id ? 0 : -1}
          >
            {tab.icon && <span className="cm-tabs__tab-icon">{tab.icon}</span>}
            <span className="cm-tabs__tab-label">{tab.label}</span>
            {tab.badge != null && tab.badge > 0 && (
              <span className="cm-tabs__tab-badge">{tab.badge > 99 ? '99+' : tab.badge}</span>
            )}
          </button>
        ))}
      </div>
      {activeTab?.content && (
        <div
          role="tabpanel"
          id={`cm-tabpanel-${activeTab.id}`}
          aria-labelledby={`cm-tab-${activeTab.id}`}
          className="cm-tabs__panel"
        >
          {activeTab.content}
        </div>
      )}
    </div>
  )
}

Tabs.displayName = 'Tabs'
