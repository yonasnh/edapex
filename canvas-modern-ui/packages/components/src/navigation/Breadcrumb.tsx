/**
 * ClassApex Breadcrumb System
 * ============================
 * Route-aware breadcrumb component with automatic path resolution.
 */

import React, { createContext, useContext, useMemo, type ReactNode } from 'react'
import './Breadcrumb.css'

// ─── Types ───

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: ReactNode
}

interface BreadcrumbContextValue {
  items: BreadcrumbItem[]
  setItems: (items: BreadcrumbItem[]) => void
}

// ─── Route-to-Breadcrumb mapping ───

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  courses: 'Courses',
  assignments: 'Assignments',
  grades: 'Grades',
  calendar: 'Calendar',
  discussions: 'Discussions',
  files: 'Files',
  groups: 'Groups',
  notifications: 'Notifications',
  settings: 'Settings',
  analytics: 'Analytics',
  reports: 'Reports',
  admin: 'Administration',
  users: 'Users',
  help: 'Help',
  profile: 'Profile',
  modules: 'Modules',
  pages: 'Pages',
  syllabus: 'Syllabus',
  outcomes: 'Outcomes',
  quizzes: 'Quizzes',
  rubrics: 'Rubrics',
  conferences: 'Conferences',
  collaborations: 'Collaborations',
  inbox: 'Inbox',
}

/**
 * Generate breadcrumb items from a URL pathname
 */
export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const items: BreadcrumbItem[] = [{ label: 'Home', href: '/dashboard' }]

  let path = ''
  for (const segment of segments) {
    path += `/${segment}`
    const label = ROUTE_LABELS[segment] || decodeURIComponent(segment)

    // Skip numeric IDs in breadcrumb labels (but keep the path)
    if (/^\d+$/.test(segment)) continue

    items.push({ label, href: path })
  }

  return items
}

// ─── Component ───

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  /** Auto-generate from current path */
  pathname?: string
  /** Max items before collapsing middle items */
  maxItems?: number
  separator?: ReactNode
}

export function Breadcrumb({
  items: propItems,
  pathname,
  maxItems = 4,
  separator = '›',
}: BreadcrumbProps) {
  const items = useMemo(() => {
    if (propItems) return propItems
    if (pathname) return generateBreadcrumbs(pathname)
    return []
  }, [propItems, pathname])

  if (items.length === 0) return null

  // Collapse middle items if too many
  let displayItems = items
  if (items.length > maxItems) {
    displayItems = [
      items[0],
      { label: '…' },
      ...items.slice(-(maxItems - 2)),
    ]
  }

  return (
    <nav aria-label="Breadcrumb" className="cx-breadcrumb">
      <ol className="cx-breadcrumb__list">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1

          return (
            <li key={index} className="cx-breadcrumb__item">
              {index > 0 && (
                <span className="cx-breadcrumb__separator" aria-hidden="true">
                  {separator}
                </span>
              )}
              {isLast || !item.href ? (
                <span
                  className={`cx-breadcrumb__text ${isLast ? 'cx-breadcrumb__text--current' : ''}`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon && <span className="cx-breadcrumb__icon">{item.icon}</span>}
                  {item.label}
                </span>
              ) : (
                <a href={item.href} className="cx-breadcrumb__link">
                  {item.icon && <span className="cx-breadcrumb__icon">{item.icon}</span>}
                  {item.label}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
