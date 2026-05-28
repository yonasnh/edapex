/**
 * RoleContext — ClassApex
 * ========================
 * Derives the active role and user from the real Canvas authentication state.
 * No demo users or mock data — all identity comes from the Canvas API via @schoolapex/core.
 */

import React, { createContext, useContext, useState, type ReactNode } from 'react'
import { useAuth } from '@schoolapex/core'

export type UserRole = 'student' | 'teacher' | 'admin' | 'observer'

export interface RoleUser {
  id: string
  name: string
  displayName: string
  email: string
  avatarSeed: string
  role: UserRole
  title: string
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

// Extracted for testability — jsdom 26 does not allow mocking window.location directly
export const reloadPage = () => window.location.reload()

function mapAuthUserToRoleUser(authUser: any | null): RoleUser {
  const canvasRoles: string[] = authUser?.roles ?? []
  const validRoles: UserRole[] = ['student', 'teacher', 'admin', 'observer']
  // Use the first valid role from the array order (preserves test/mock control)
  const role: UserRole = validRoles.find((r) => canvasRoles.includes(r)) || 'student'

  return {
    id: String(authUser?.id ?? ''),
    name: authUser?.name ?? 'User',
    displayName: authUser?.name ?? 'User',
    email: authUser?.email ?? '',
    avatarSeed: authUser?.name ?? 'User',
    role,
    title: authUser?.title ?? '',
  }
}

export function RoleProvider({ children, defaultRole = 'student' }: RoleProviderProps) {
  const { user: authUser } = useAuth()
  const realUser = mapAuthUserToRoleUser(authUser)

  // Compute available roles synchronously before useState initializer
  const availableRoles = React.useMemo<UserRole[]>(() => {
    const roles = new Set<UserRole>([realUser.role])
    const canvasRoles: string[] = authUser?.roles ?? []
    canvasRoles.forEach((r) => {
      if (['student', 'teacher', 'admin', 'observer'].includes(r)) {
        roles.add(r as UserRole)
      }
    })
    return Array.from(roles)
  }, [authUser, realUser.role])

  const initialRole = React.useMemo<UserRole>(() => {
    const saved = localStorage.getItem('classapex-view-role')
    const savedRole = saved as UserRole
    if (savedRole && availableRoles.includes(savedRole)) {
      return savedRole
    }
    // When defaultRole is explicitly set (test environments), prefer it if available.
    // In production defaultRole is never overridden, so realUser.role is used.
    if (defaultRole !== 'student' && availableRoles.includes(defaultRole)) {
      return defaultRole
    }
    return realUser.role || defaultRole
  }, [availableRoles, realUser.role, defaultRole])

  const [role, setRole] = useState<UserRole>(initialRole)

  const [masqueradedUser, setMasqueradedUser] = useState<RoleUser | null>(null)

  const handleSetRole = (newRole: UserRole) => {
    // Only allow switching to roles the user actually has
    if (!availableRoles.includes(newRole)) {
      console.warn(`[RoleContext] User does not have role: ${newRole}`)
      return
    }
    setRole(newRole)
    localStorage.setItem('classapex-view-role', newRole)
    // If switching role, cancel masquerade
    setMasqueradedUser(null)
    reloadPage()
  }

  const handleMasquerade = (user: RoleUser | null) => {
    setMasqueradedUser(user)
    // Masquerade state is session-only; it does not persist to localStorage.
    // Real Canvas masquerade should use the server-side /users/:id/masquerade endpoint.
    reloadPage()
  }

  // currentUser reflects the active role view, even if it differs from the auth user's primary role
  const currentUser = React.useMemo<RoleUser>(() => {
    const base = masqueradedUser || realUser
    return { ...base, role }
  }, [masqueradedUser, realUser, role])

  // allUsers is retained for compatibility with RoleSwitcher, but only contains the real user
  const allUsers = React.useMemo<Record<UserRole, RoleUser>>(() => {
    const base: Record<UserRole, RoleUser> = {
      student: realUser,
      teacher: realUser,
      admin: realUser,
      observer: realUser,
    }
    // If the user has multiple roles, we still show the same real user object
    // under each available role key so the switcher can list them.
    availableRoles.forEach((r) => {
      base[r] = { ...realUser, role: r }
    })
    return base
  }, [realUser, availableRoles])

  return (
    <RoleContext.Provider
      value={{
        role: currentUser.role,
        user: currentUser,
        setRole: handleSetRole,
        allUsers,
        masqueradeAs: handleMasquerade,
        isMasquerading: !!masqueradedUser,
        realUser,
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export function useRole(): RoleContextType {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within RoleProvider')
  return ctx
}
