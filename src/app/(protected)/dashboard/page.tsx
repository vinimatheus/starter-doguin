'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganizationContext } from '@/providers/organization-provider'

export default function DashboardRouter() {
  const { organizations, isLoading } = useOrganizationContext()
  const router = useRouter()

  // Redirecionamento após a verificação de organizações
  useEffect(() => {
    if (!isLoading) {
      if (organizations.length > 0) {
        // Se tiver organizações, redireciona para a primeira
        router.push(`/dashboard/${organizations[0].id}/overview`)
      } else {
        // Se não tiver organizações, redireciona para a página de criação
        router.push('/create-organization')
      }
    }
  }, [organizations, isLoading, router])

  // Enquanto carrega, exibir um indicador de carregamento
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-r-transparent rounded-full"></div>
      <span className="ml-2">Verificando suas organizações...</span>
    </div>
  )
} 