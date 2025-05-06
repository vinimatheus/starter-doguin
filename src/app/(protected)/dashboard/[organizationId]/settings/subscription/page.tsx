'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { redirect, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useOrganizationContext } from '@/providers/organization-provider'
import { MemberRole } from '@prisma/client'
import { canPerformAction } from '@/lib/rbac'

export default function SubscriptionPage() {
  const { activeOrganization } = useOrganizationContext()
  const params = useParams()
  const organizationId = params.organizationId as string
  const [isLoading, setIsLoading] = useState(true)
  
  // Verificar permissão usando client-side e verificação adicional via API
  useEffect(() => {
    // Verificação client-side (primeira camada)
    if (activeOrganization) {
      const userRole = activeOrganization.role as MemberRole
      const canManageSubscription = canPerformAction(userRole, 'subscription:view')
      
      if (!canManageSubscription) {
        redirect(`/dashboard/${organizationId}/settings/profile`)
        return
      }
    }
    
    // Verificação adicional via API serverless (segunda camada)
    async function checkPermission() {
      try {
        const response = await fetch(`/api/permissions?organizationId=${organizationId}&page=subscription`)
        const data = await response.json()
        
        if (!data.hasPermission) {
          redirect(`/dashboard/${organizationId}/settings/profile`)
        }
      } catch (error) {
        console.error('Erro ao verificar permissões:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkPermission()
  }, [activeOrganization, organizationId])
  
  // Enquanto verifica permissões, não mostrar conteúdo
  if (isLoading || !activeOrganization) {
    return null
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Assinatura</h2>
      <p className="mb-4 text-muted-foreground">
        Gerencie seu plano de assinatura e informações de pagamento
      </p>
      
      <div className="space-y-6">
        <div className="border p-4 rounded-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Plano atual</h3>
            <Badge variant="default">Ativo</Badge>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Plano</p>
              <p className="font-medium">Free</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Ciclo de cobrança</p>
              <p className="font-medium">Mensal</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Próxima cobrança</p>
              <p className="font-medium">Não aplicável</p>
            </div>
            
            <Button>Atualizar plano</Button>
          </div>
        </div>
        
        <div className="border p-4 rounded-md">
          <h3 className="font-medium mb-4">Forma de pagamento</h3>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Nenhuma forma de pagamento cadastrada.
            </p>
            
            <Button variant="outline">Adicionar forma de pagamento</Button>
          </div>
        </div>
        
        <div className="border p-4 rounded-md">
          <h3 className="font-medium mb-4">Histórico de pagamentos</h3>
          <p className="text-sm text-muted-foreground">
            Você ainda não tem pagamentos registrados.
          </p>
        </div>
      </div>
    </div>
  )
}