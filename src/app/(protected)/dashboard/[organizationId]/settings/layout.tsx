'use client'

import { useOrganizationContext } from '@/providers/organization-provider'
import PageContainer from '@/components/layout/page-container'
import { Skeleton } from '@/components/ui/skeleton'
import { useParams, usePathname } from 'next/navigation'
import { Icons } from '@/components/icons'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { MemberRole } from '@prisma/client'
import { canPerformAction, RBACAction } from '@/lib/rbac'

// Definindo os itens da sidebar de configurações
const settingsNavItems = [
  {
    title: 'Perfil',
    icon: 'user',
    href: '/profile',
    requiredPermission: null // Todos os usuários podem acessar
  },
  {
    title: 'Organização',
    icon: 'Enterprise',
    href: '/organization',
    requiredPermission: 'organization:update' as RBACAction // Apenas admins e owners
  },
  {
    title: 'Membros',
    icon: 'user2',
    href: '/members',
    requiredPermission: 'member:view' as RBACAction // Todos os usuários podem ver membros
  },
  {
    title: 'Preferências',
    icon: 'settings',
    href: '/preferences',
    requiredPermission: null // Todos os usuários podem acessar
  },
  {
    title: 'Assinatura',
    icon: 'billing',
    href: '/subscription',
    requiredPermission: 'subscription:view' as RBACAction // Apenas owners
  }
]

export default function SettingsLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { activeOrganization, isLoading } = useOrganizationContext()
  const params = useParams()
  const pathname = usePathname()
  const organizationId = params.organizationId as string
  
  if (isLoading || !activeOrganization) {
    return (
      <PageContainer>
        <div className="mb-4">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </PageContainer>
    )
  }

  // Filtrar os itens de navegação com base no papel do usuário
  const currentUserRole = activeOrganization.role as MemberRole;
  const filteredNavItems = settingsNavItems.filter(item => {
    // Se o item não requer permissão especial, mostrar para todos
    if (!item.requiredPermission) return true;
    
    // Caso contrário, verificar se o usuário tem a permissão necessária
    return canPerformAction(currentUserRole, item.requiredPermission);
  });

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row w-full gap-8">
        {/* Sidebar de Configurações */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-4 font-medium border-b">
              Configurações
            </div>
            <nav className="flex flex-col p-2">
              {filteredNavItems.map((item) => {
                const Icon = Icons[item.icon as keyof typeof Icons]
                const itemPath = `/dashboard/${organizationId}/settings${item.href}`
                const isActive = pathname === itemPath
                
                return (
                  <Link
                    key={item.href}
                    href={itemPath}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-grow">
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}