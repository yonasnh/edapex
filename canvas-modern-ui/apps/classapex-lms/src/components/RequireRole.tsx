import React from 'react'
import { Navigate } from 'react-router-dom'
import { useRole, type UserRole } from '../contexts/RoleContext'

interface RequireRoleProps {
  allowed: UserRole[]
  fallback?: string
  children: React.ReactNode
}

export const RequireRole: React.FC<RequireRoleProps> = ({ allowed, fallback = '/dashboard', children }) => {
  const { role } = useRole()
  if (!allowed.includes(role)) {
    return <Navigate to={fallback} replace />
  }
  return <>{children}</>
}
