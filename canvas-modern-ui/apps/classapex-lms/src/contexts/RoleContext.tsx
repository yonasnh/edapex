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
    id: '1',
    name: 'Alex Johnson',
    displayName: 'Alex Johnson',
    email: 'alex.johnson@classapex.edu',
    avatarSeed: 'Alex',
    role: 'student',
    title: 'Computer Science, Junior',
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
    name: 'Admin Portal',
    displayName: 'System Administrator',
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

  const handleSetRole = (newRole: UserRole) => {
    setRole(newRole)
    localStorage.setItem('classapex-demo-role', newRole)
  }

  return (
    <RoleContext.Provider value={{
      role,
      user: DEMO_USERS[role],
      setRole: handleSetRole,
      allUsers: DEMO_USERS,
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
