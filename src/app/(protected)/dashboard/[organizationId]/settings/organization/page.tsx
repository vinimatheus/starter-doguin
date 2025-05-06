import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Building } from 'lucide-react'
import { redirect } from 'next/navigation'
import { MemberRole } from '@prisma/client'
import { canPerformAction } from '@/lib/rbac'
import { getOrganizationById } from '@/actions/organization'

export default async function OrganizationPage({ params }: { params: Promise<{ organizationId: string }> }) {
  // Resolver os parâmetros da URL
  const { organizationId } = await params
  
  // Buscar organização usando server action
  const organizationResult = await getOrganizationById(organizationId)
  
  // Se não encontrou a organização ou ocorreu erro, redirecionar
  if (!organizationResult.success) {
    redirect(`/dashboard/${organizationId}/settings/profile`)
  }
  
  const activeOrganization = organizationResult.organization
  
  // Verificar permissão no servidor
  const userRole = activeOrganization.role as MemberRole
  const canManageOrganization = canPerformAction(userRole, 'organization:update')
  
  if (!canManageOrganization) {
    redirect(`/dashboard/${organizationId}/settings/profile`)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Organização</h2>
      <p className="mb-4 text-muted-foreground">
        Gerencie as informações da sua organização
      </p>
      
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
              <Building className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>{activeOrganization?.name || 'Sem nome'}</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <></>
          </CardContent>
          
          <CardFooter>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
