import React, { useState, useCallback } from 'react'

const TYPE_ICONS: Record<string, string> = {
  Page: 'file-text',
  Assignment: 'pencil',
  Quiz: 'help-circle',
  Discussion: 'message-square',
  File: 'file',
  ExternalUrl: 'external-link',
  SubHeader: 'type',
}

const TYPE_LABELS: Record<string, string> = {
  Page: 'Page',
  Assignment: 'Assignment',
  Quiz: 'Quiz',
  Discussion: 'Discussion',
  File: 'File',
  ExternalUrl: 'External Link',
  SubHeader: 'Sub Header',
}

interface CompletionRequirement {
  type: 'must_view' | 'must_submit' | 'must_contribute' | 'must_mark_done' | 'min_score'
  min_score?: number
  completed?: boolean
}

export interface ModuleItemData {
  id: number
  title: string
  type: string
  content_id?: number | null
  url?: string
  external_url?: string
  completion_requirement?: CompletionRequirement | null
  indent?: number
}

interface ModuleItemProps {
  item: ModuleItemData
}

export function ModuleItem({ item }: ModuleItemProps) {
  const [completed, setCompleted] = useState(item.completion_requirement?.completed ?? false)
  const isSubHeader = item.type === 'SubHeader'
  const isExternal = item.type === 'ExternalUrl'
  const href = isExternal && item.external_url ? item.external_url : item.url || '#'
  const reqType = item.completion_requirement?.type

  const handleToggleComplete = useCallback((e: React.MouseEvent) => {
    if (reqType === 'must_view' || reqType === 'must_mark_done') {
      e.preventDefault()
      e.stopPropagation()
      setCompleted(prev => !prev)
    }
  }, [reqType])

  if (isSubHeader) {
    return (
      <div className="cx-module-subheader">
        <span className="cx-module-subheader__text">{item.title}</span>
      </div>
    )
  }

  return (
    <a
      href={href}
      className={`cx-module-item ${completed ? 'cx-module-item--completed' : ''}`}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
    >
      <span
        className={`cx-module-item__icon ${completed ? 'cx-module-item__icon--done' : ''}`}
        title={completed ? 'Marked complete' : 'Mark as complete'}
        onClick={handleToggleComplete}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleToggleComplete(e as any) }}
      >
        {completed ? '\u2713' : '\u25CB'}
      </span>
      <span className="cx-module-item__title">{item.title}</span>
      <span className="cx-module-item__type-badge">{TYPE_LABELS[item.type] || item.type}</span>
      {reqType && (
        <span className="cx-module-item__req" title={`Requirement: ${reqType.replace(/_/g, ' ')}`}>
          {reqType === 'must_submit' ? 'Submit' : reqType === 'must_view' ? 'View' : reqType === 'must_contribute' ? 'Contribute' : reqType === 'min_score' ? `Score: ${item.completion_requirement?.min_score}` : 'Mark done'}
        </span>
      )}
    </a>
  )
}
