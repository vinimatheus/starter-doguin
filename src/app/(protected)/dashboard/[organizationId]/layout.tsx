'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganizationContext } from '@/providers/organization-provider'
import { toast } from 'sonner'
import React from 'react'
import { getOrganizationById } from '@/actions/organization'

// Componente wrapper que lida com a Promise dos parâmetros
export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ organizationId: string }>
}) {
  return (
    <DashboardContent params={params}>
      {children}
    </DashboardContent>
  )
}

// Componente interno que usa os hooks React
function DashboardContent({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ organizationId: string }>
}) {
  const { activeOrganization, isLoading } = useOrganizationContext()
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    // Verificar explicitamente se o usuário tem acesso à organização
    const verifyAccess = async () => {
      try {
        const { organizationId } = await params
        
        // Se já temos a organização ativa e ela corresponde ao ID da URL, não precisamos verificar novamente
        if (activeOrganization?.id === organizationId) {
          setIsVerifying(false)
          return
        }

        setIsVerifying(true)
        
        const result = await getOrganizationById(organizationId)
        
        if (!isMounted) return

        // Verifica se result existe e depois se tem a propriedade error
        if (result && 'error' in result && result.error) {
          setError(result.error)
          toast.error(result.error)
          router.push('/dashboard')
          return
        }
        
        // Verificar se a resposta não possui a propriedade success
        if (!result || !('success' in result) || !result.success) {
          setError('Resposta inválida ao verificar acesso à organização')
          toast.error('Erro ao verificar acesso à organização')
          router.push('/dashboard')
          return
        }
        
        // Verificação bem-sucedida
        setError(null)
      } catch (error) {
        if (!isMounted) return
        
        console.error('Erro ao verificar acesso à organização:', error)
        setError('Erro ao verificar acesso')
        toast.error('Erro ao verificar acesso à organização')
        router.push('/dashboard')
      } finally {
        if (isMounted) {
          setIsVerifying(false)
        }
      }
    }
    
    verifyAccess()

    return () => {
      isMounted = false
    }
  }, [params, router, activeOrganization])

  // Verificação adicional com o contexto da organização
  useEffect(() => {
    if (!isLoading && !activeOrganization && !isVerifying && !error) {
      toast.error('Você não tem acesso a esta organização')
      router.push('/dashboard')
    }
  }, [activeOrganization, isLoading, router, isVerifying, error])

  if (isLoading || isVerifying) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-r-transparent rounded-full"></div>
        <span className="ml-2">Verificando acesso à organização...</span>
      </div>
    )
  }

  if (error) {
    return null // Não renderizar nada, o redirecionamento já foi feito
  }

  if (!activeOrganization) {
    return null
  }

  return (
    <>
      {children}
    </>
  )
}
