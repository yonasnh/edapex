/**
 * RoleContext — Demo role switching for ClassApex
 * =================================================
 * Allows switching between Student, Teacher, and Admin personas
 * to demonstrate role-aware navigation, dashboards, and features.
 *
 * In production, this would be derived from Canvas OAuth token claims.
 */

import React, { createContext, useContext, useState, type ReactNode } from 'react'

export type UserRole = 'student' | 'teacher' | 'admin'

export interface RoleUser {
  id: string
  name: string
  displayName: string
  email: string
  avatarSeed: string
  role: UserRole
  title: string
}

const DEMO_USERS: Record<UserRole, RoleUser> = {
  student: {
    id: '8',
    name: 'PlayStudent lMRL5n2z16',
    displayName: 'PlayStudent lMRL5n2z16',
    email: 'playstudentlMRL5n2z16@example.com',
    avatarSeed: 'PlayStudent',
    role: 'student',
    title: 'Demo Student, Junior',
  },
  teacher: {
    id: '100',
    name: 'Dr. Sarah Chen',
    displayName: 'Dr. Sarah Chen',
    email: 'sarah.chen@classapex.edu',
    avatarSeed: 'Sarah',
    role: 'teacher',
    title: 'Professor of Computer Science',
  },
  admin: {
    id: '999',
    name: 'System Admin',
    displayName: 'System Admin',
    email: 'admin@classapex.edu',
    avatarSeed: 'Admin',
    role: 'admin',
    title: 'IT Administration',
  },
}

interface RoleContextType {
  role: UserRole
  user: RoleUser
  setRole: (role: UserRole) => void
  allUsers: Record<UserRole, RoleUser>
  masqueradeAs: (user: RoleUser | null) => void
  isMasquerading: boolean
  realUser: RoleUser
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

interface RoleProviderProps {
  children: ReactNode
  defaultRole?: UserRole
}

export function RoleProvider({ children, defaultRole = 'student' }: RoleProviderProps) {
  const [role, setRole] = useState<UserRole>(() => {
    // Persist role across page reloads during demo
    const saved = localStorage.getItem('classapex-demo-role')
    return (saved as UserRole) || defaultRole
  })

  const [masqueradedUser, setMasqueradedUser] = useState<RoleUser | null>(() => {
    const saved = localStorage.getItem('classapex-masquerade-user')
    return saved ? JSON.parse(saved) : null
  })

  const handleSetRole = (newRole: UserRole) => {
    setRole(newRole)
    localStorage.setItem('classapex-demo-role', newRole)
    // If switching role, cancel masquerade
    setMasqueradedUser(null)
    localStorage.removeItem('classapex-masquerade-user')
    window.location.reload()
  }

  const handleMasquerade = (user: RoleUser | null) => {
    setMasqueradedUser(user)
    if (user) {
      localStorage.setItem('classapex-masquerade-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('classapex-masquerade-user')
    }
    window.location.reload()
  }

  const realUser = DEMO_USERS[role]
  const currentUser = masqueradedUser || realUser

  return (
    <RoleContext.Provider value={{
      role: currentUser.role,
      user: currentUser,
      setRole: handleSetRole,
      allUsers: DEMO_USERS,
      masqueradeAs: handleMasquerade,
      isMasquerading: !!masqueradedUser,
      realUser,
    }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole(): RoleContextType {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within RoleProvider')
  return ctx
}
