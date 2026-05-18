import React, { useState, useMemo } from 'react'

interface Person {
  id: number
  display_name: string
  avatar_url?: string
  email?: string
  enrollments?: { role: string; type: string }[]
  bio?: string
}

interface PeopleListProps {
  people: Person[]
  isLoading?: boolean
}

export function PeopleList({ people, isLoading = false }: PeopleListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  const roles = useMemo(() => {
    const r = new Set<string>()
    people.forEach(p => p.enrollments?.forEach(e => r.add(e.role)))
    return Array.from(r).sort()
  }, [people])

  const filtered = useMemo(() => {
    let result = people
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p => p.display_name.toLowerCase().includes(q))
    }
    if (filterRole !== 'all') {
      result = result.filter(p => p.enrollments?.some(e => e.role === filterRole))
    }
    return result
  }, [people, searchQuery, filterRole])

  if (isLoading) {
    return <div className="cx-skeleton cx-skeleton--list" />
  }

  if (!people || people.length === 0) {
    return <p className="cx-widget__empty">No people in this course</p>
  }

  return (
    <div className="cx-people">
      <div className="cx-people__controls">
        <input
          type="search"
          className="cx-people__search"
          placeholder="Search people..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <select
          className="cx-people__filter"
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          aria-label="Filter by role"
        >
          <option value="all">All Roles</option>
          {roles.map(r => (
            <option key={r} value={r}>{r.replace('Enrollment', '').replace(/([A-Z])/g, ' $1').trim()}</option>
          ))}
        </select>
      </div>
      <ul className="cx-people__list">
        {filtered.map(person => {
          const role = person.enrollments?.[0]?.role?.replace('Enrollment', '').replace(/([A-Z])/g, ' $1').trim() || ''
          const initials = person.display_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
          return (
            <li key={person.id} className="cx-people__item">
              <span className="cx-people__avatar">{initials}</span>
              <div className="cx-people__info">
                <span className="cx-people__name">{person.display_name}</span>
                <span className="cx-people__role">{role}</span>
              </div>
              {person.bio && <span className="cx-people__bio" title={person.bio}>i</span>}
            </li>
          )
        })}
      </ul>
      <p className="cx-people__count">{filtered.length} of {people.length} people</p>
    </div>
  )
}
