import React from 'react'

interface AssignmentGroup {
  id: number
  name: string
  weight: number
  assignment_ids: number[]
}

interface AssignmentGroupsProps {
  groups: AssignmentGroup[]
  isLoading?: boolean
}

export function AssignmentGroups({ groups, isLoading = false }: AssignmentGroupsProps) {
  if (isLoading) {
    return (
      <div className="cx-assignment-groups">
        {[1, 2, 3].map(i => <div key={i} className="cx-skeleton cx-skeleton--group" />)}
      </div>
    )
  }

  if (!groups || groups.length === 0) {
    return <p className="cx-widget__empty">No assignment groups configured</p>
  }

  const totalWeight = groups.reduce((s, g) => s + g.weight, 0)

  return (
    <div className="cx-assignment-groups">
      <h3 className="cx-assignment-groups__title">Assignment Groups</h3>
      <div className="cx-assignment-groups__list">
        {groups.map(g => (
          <div key={g.id} className="cx-assignment-groups__item">
            <div className="cx-assignment-groups__item-header">
              <span className="cx-assignment-groups__item-name">{g.name}</span>
              <span className="cx-assignment-groups__item-weight">{g.weight}%</span>
            </div>
            <div className="cx-assignment-groups__item-bar">
              <div
                className="cx-assignment-groups__item-fill"
                style={{ width: `${(g.weight / totalWeight) * 100}%` }}
              />
            </div>
            <span className="cx-assignment-groups__item-count">
              {g.assignment_ids.length} assignment{g.assignment_ids.length !== 1 ? 's' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
