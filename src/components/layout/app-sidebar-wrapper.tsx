'use client'

import { useOrganizationContext } from '@/providers/organization-provider'
import AppSidebar from '@/components/layout/app-sidebar'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function AppSidebarWrapper() {
  const { activeOrganization, organizations } = useOrganizationContext()
  const pathname = usePathname()
  
  // Adicionar classe ao body para controlar o layout
  useEffect(() => {
    const neesSidebar = !(pathname === '/dashboard' && organizations.length === 0)
    
    if (neesSidebar) {
      document.body.classList.add('has-sidebar')
    } else {
      document.body.classList.remove('has-sidebar')
    }
    
    return () => {
      document.body.classList.remove('has-sidebar')
    }
  }, [pathname, organizations.length])
  
  // Não exibir a sidebar nas rotas principais sem organizações
  if (pathname === '/dashboard' && organizations.length === 0) {
    return null
  }
  
  // Exibir a sidebar apenas quando há uma organização ativa
  if (!activeOrganization && !pathname.includes('/dashboard/')) {
    return null
  }
  
  return <AppSidebar />
} 