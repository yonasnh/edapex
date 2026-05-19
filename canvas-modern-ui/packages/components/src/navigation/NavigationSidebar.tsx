import React, { memo, useState } from 'react'
import clsx from 'clsx'
import { User } from '@schoolapex/core'

function DashboardIcon(props: any) { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/><rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/></svg>; }
function CourseIcon(props: any) { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 16.5A2.5 2.5 0 015.5 14H17"/><path d="M5.5 2H17v15H5.5A2.5 2.5 0 013 14.5v-12A2.5 2.5 0 015.5 2z"/></svg>; }
function AssignmentIcon(props: any) { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="1.5" width="14" height="17" rx="2"/><path d="M7 6h6M7 10h6M7 14h4"/></svg>; }
function CalendarIcon(props: any) { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1.5" y="3" width="17" height="16" rx="2"/><path d="M1.5 7h17"/><path d="M6 1v4M14 1v4"/><path d="M6 11h2M10 11h2M14 11h2M6 14h2M10 14h2M14 14h2"/></svg>; }
function ChatIcon(props: any) { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 1h14a2 2 0 012 2v10a2 2 0 01-2 2H7l-4 4V3a2 2 0 012-2z"/><path d="M6 7h8M6 10h6"/></svg>; }
function FolderIcon(props: any) { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1.5 4a1 1 0 011-1h5l2 2h7a1 1 0 011 1v10a1 1 0 01-1 1h-14a1 1 0 01-1-1V4z"/></svg>; }
function GradeIcon(props: any) { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 1l2.5 5L18 6.5l-4 3.5 1 5.5L10 13l-5 2.5 1-5.5-4-3.5L7.5 6 10 1z"/></svg>; }
function SettingsIcon(props: any) { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="2.5"/><path d="M10 1v3M10 16v3M1 10h3M16 10h3M4.5 4.5l2 2M13.5 13.5l2 2M4.5 15.5l2-2M13.5 6.5l2-2"/></svg>; }
function NotificationIcon(props: any) { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 2a6 6 0 00-6 6c0 3-1 5-2 6h16c-1-1-2-3-2-6a6 6 0 00-6-6z"/><path d="M8 14a2 2 0 004 0"/></svg>; }
function HelpIcon(props: any) { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8"/><path d="M8 7.5a2 2 0 114 0c0 1.5-2 2-2 3.5"/><circle cx="10" cy="14" r="0.5" fill="currentColor"/></svg>; }
function ChevronLeftIcon(props: any) { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 3L5 8l5 5"/></svg>; }
function ChevronRightIcon(props: any) { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3l5 5-5 5"/></svg>; }
function ChevronDownIcon(props: any) { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 5l3 3 3-3"/></svg>; }
function GroupIcon(props: any) { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 17v-1.5a3.5 3.5 0 00-3.5-3.5h-5A3.5 3.5 0 002 15.5V17"/><circle cx="7.5" cy="6" r="3.5"/><path d="M18 17v-1.5a3.5 3.5 0 00-2.5-3.4"/><circle cx="14" cy="6" r="3.5"/></svg>; }
function HomeIcon(props: any) { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 10l7-7 7 7"/><path d="M5 8v8h4v-5h4v5h4V8"/></svg>; }

function SunIcon(props: any) { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="5"/><path d="M10 1v2M10 17v2M1 10h2M17 10h2M3.64 3.64l1.41 1.41M14.95 14.95l1.41 1.41M3.64 16.36l1.41-1.41M14.95 5.05l1.41-1.41"/></svg>; }
function MoonIcon(props: any) { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.29 13.9A8 8 0 118.9 3.5a6 6 0 008.39 10.4z"/></svg>; }

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<any>
  href?: string
  onClick?: () => void
  badge?: number
  children?: NavigationItem[]
  roles?: ('student' | 'teacher' | 'ta' | 'observer' | 'admin' | 'designer')[]
}

interface NavigationSidebarProps {
  currentUser: User
  activeItem?: string
  isCollapsed?: boolean
  onToggleCollapse?: (collapsed: boolean) => void
  onNavigate?: (itemId: string, href?: string) => void
  customItems?: NavigationItem[]
  showBadges?: boolean
  logo?: React.ReactNode
  className?: string
  'data-testid'?: string
  theme?: 'light' | 'dark'
  onThemeToggle?: () => void
}

export const NavigationSidebar = memo<NavigationSidebarProps>(
  ({
    currentUser,
    activeItem = 'dashboard',
    isCollapsed = false,
    onToggleCollapse,
    onNavigate,
    customItems = [],
    showBadges = true,
    logo,
    className,
    'data-testid': testId,
    theme = 'light',
    onThemeToggle,
  }) => {
    const [expandedMenus, setExpandedMenus] = useState<string[]>([])

    const defaultNavigationItems: NavigationItem[] = [
      { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, href: '/dashboard' },
      { id: 'courses', label: 'Courses', icon: CourseIcon, href: '/courses', children: [
        { id: 'all-courses', label: 'All Courses', icon: CourseIcon, href: '/courses' },
        { id: 'favorites', label: 'Favorites', icon: CourseIcon, href: '/courses/favorites' },
      ]},
      { id: 'assignments', label: 'Assignments', icon: AssignmentIcon, href: '/assignments', badge: 3 },
      { id: 'grades', label: 'Grades', icon: GradeIcon, href: '/grades', roles: ['student', 'teacher'] },
      { id: 'calendar', label: 'Calendar', icon: CalendarIcon, href: '/calendar' },
      { id: 'discussions', label: 'Discussions', icon: ChatIcon, href: '/discussions', badge: 2 },
      { id: 'files', label: 'Files', icon: FolderIcon, href: '/files' },
      { id: 'groups', label: 'Groups', icon: GroupIcon, href: '/groups', roles: ['student', 'teacher'] },
      { id: 'notifications', label: 'Notifications', icon: NotificationIcon, href: '/notifications', badge: 5 },
      { id: 'settings', label: 'Settings', icon: SettingsIcon, href: '/settings' },
      { id: 'help', label: 'Help', icon: HelpIcon, href: '/help' },
    ]

    const navigationItems = customItems.length > 0 ? customItems : defaultNavigationItems
    const mainNavigationItems = navigationItems.filter(item => item.id !== 'help')

    const handleItemClick = (item: NavigationItem, event?: React.MouseEvent) => {
      if (event) event.preventDefault()
      if (item.onClick) item.onClick()
      else if (onNavigate) onNavigate(item.id, item.href)
    }

    const handleMenuToggle = (menuId: string) => {
      setExpandedMenus(prev => prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId])
    }

    const hasPermission = (item: NavigationItem) => {
      if (!item.roles || item.roles.length === 0) return true
      return item.roles.some(role => currentUser.roles.includes(role))
    }

    const renderNavItem = (item: NavigationItem) => {
      if (!hasPermission(item)) return null

      const isActive = activeItem === item.id
      const hasChildren = item.children && item.children.length > 0
      const isExpanded = expandedMenus.includes(item.id)
      const Icon = item.icon

      if (hasChildren) {
        return (
          <li key={item.id} className={clsx('navigation-sidebar__menu', isActive && 'navigation-sidebar__menu--active')}>
            <button
              className="navigation-sidebar__menu-trigger"
              onClick={() => handleMenuToggle(item.id)}
              aria-expanded={isExpanded}
            >
              <span className="navigation-sidebar__menu-icon"><Icon size={20} /></span>
              {!isCollapsed && (
                <>
                  <span className="navigation-sidebar__menu-label">{item.label}</span>
                  <span className={clsx('navigation-sidebar__menu-chevron', isExpanded && 'navigation-sidebar__menu-chevron--expanded')}>
                    <ChevronDownIcon />
                  </span>
                </>
              )}
            </button>
            {(isExpanded || isCollapsed) && (
              <ul className="navigation-sidebar__submenu">
                {item.children!.map(child => {
                  const isChildActive = activeItem === child.id
                  const ChildIcon = child.icon
                  return (
                    <li key={child.id} className="navigation-sidebar__subitem">
                      <button
                        className={clsx('navigation-sidebar__sublink', isChildActive && 'navigation-sidebar__sublink--active')}
                        onClick={(e) => handleItemClick(child, e)}
                      >
                        <span className="navigation-sidebar__sublink-icon"><ChildIcon size={16} /></span>
                        <span className="navigation-sidebar__sublink-label">{child.label}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </li>
        )
      }

      return (
        <li key={item.id} className="navigation-sidebar__item">
          <button
            className={clsx('navigation-sidebar__link', isActive && 'navigation-sidebar__link--active')}
            onClick={(e) => handleItemClick(item, e)}
          >
            <span className="navigation-sidebar__link-icon">
              <Icon size={20} />
            </span>
            {!isCollapsed && (
              <span className="navigation-sidebar__link-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span>{item.label}</span>
                {showBadges && item.badge && item.badge > 0 && (
                  <span className="navigation-sidebar__badge">{item.badge > 99 ? '99+' : item.badge}</span>
                )}
              </span>
            )}
          </button>
        </li>
      )
    }

    return (
      <div
        className={clsx('navigation-sidebar', isCollapsed ? 'navigation-sidebar--collapsed' : 'navigation-sidebar--expanded', className)}
        data-testid={testId}
      >
        <div className="navigation-sidebar__scroll">
          {logo && <div className="navigation-sidebar__logo">{logo}</div>}

          <nav aria-label="Main navigation" className="navigation-sidebar__content">
            <ul className="navigation-sidebar__list">
              {mainNavigationItems.map(renderNavItem)}
            </ul>
          </nav>

          {onThemeToggle && (
            <div className="navigation-sidebar__theme-section">
              <div className="navigation-sidebar__divider" />
              <button
                className="navigation-sidebar__theme-toggle"
                onClick={onThemeToggle}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                <span className="navigation-sidebar__theme-icon">
                  {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                </span>
                {!isCollapsed && (
                  <span className="navigation-sidebar__theme-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    <span className={clsx('navigation-sidebar__switch', theme === 'dark' && 'navigation-sidebar__switch--active')}>
                      <span className="navigation-sidebar__switch-handle" />
                    </span>
                  </span>
                )}
              </button>
            </div>
          )}

          <div className="navigation-sidebar__help-section">
            <div className="navigation-sidebar__divider" />
            <button
              className={clsx('navigation-sidebar__help-button', activeItem === 'help' && 'navigation-sidebar__help-button--active')}
              onClick={() => {
                const helpItem = navigationItems.find(item => item.id === 'help')
                if (helpItem) {
                  handleItemClick(helpItem)
                } else if (onNavigate) {
                  onNavigate('help', '/help')
                }
              }}
              aria-label="Help & Support"
            >
              <span className="navigation-sidebar__help-icon">
                <HelpIcon size={20} />
              </span>
              {!isCollapsed && (
                <span className="navigation-sidebar__help-label">Help & Support</span>
              )}
            </button>
          </div>

          {onToggleCollapse && (
            <div className="navigation-sidebar__toggle">
              <button
                className={clsx('navigation-sidebar__toggle-button', 'cx-btn cx-btn--ghost cx-btn--sm')}
                onClick={() => onToggleCollapse(!isCollapsed)}
                aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
              >
                {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </button>
            </div>
          )}
        </div>
        <div className="sr-only">
          Navigation sidebar {isCollapsed ? 'collapsed' : 'expanded'}.
          Current user: {currentUser.name}. Active section: {activeItem}.
          {showBadges && 'Badge notifications are enabled.'}
        </div>
      </div>
    )
  }
)

NavigationSidebar.displayName = 'NavigationSidebar'
