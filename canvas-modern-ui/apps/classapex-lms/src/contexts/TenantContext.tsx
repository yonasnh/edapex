import React, { createContext, useContext, type ReactNode } from 'react'
import { loadTenantConfig, type TenantConfig, type InstitutionTier } from '../../../../packages/core/src/config/tenant.config'

interface TenantContextType {
  config: TenantConfig
  tier: InstitutionTier
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

interface TenantProviderProps {
  children: ReactNode
  tier?: InstitutionTier
}

export function TenantProvider({ children, tier }: TenantProviderProps) {
  const config = loadTenantConfig(tier)
  return (
    <TenantContext.Provider value={{ config, tier: config.tier }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant(): TenantContextType {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant must be used within TenantProvider')
  return ctx
}
