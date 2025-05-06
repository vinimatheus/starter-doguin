'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useOptimizedOrganizations } from '@/hooks/use-optimized-organizations'
import { Organization } from '@/types/organization'

interface OrganizationContextType {
  organizations: Organization[]
  activeOrganization: Organization | null
  setActiveOrganization: (organization: Organization) => void
  isLoading: boolean
  refreshOrganizations: () => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function useOrganizationContext() {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganizationContext deve ser usado dentro de um OrganizationProvider')
  }
  return context
}

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const {
    organizations,
    activeOrganization,
    setActiveOrganization,
    isLoading,
    refreshOrganizations
  } = useOptimizedOrganizations()

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        activeOrganization,
        setActiveOrganization,
        isLoading,
        refreshOrganizations
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
} 