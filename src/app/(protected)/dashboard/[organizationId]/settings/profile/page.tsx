import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { currentUser } from '@/lib/auth'
import { getOrganizationById } from '@/actions/organization'

export default async function ProfilePage({ params }: { params: Promise<{ organizationId: string }> }) {
  // Resolver os parâmetros da URL
  const { organizationId } = await params
  
  const user = await currentUser()
  const organizationResult = await getOrganizationById(organizationId)
  const activeOrganization = organizationResult.success ? organizationResult.organization : null

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Perfil</h2>
      <p className="mb-4 text-muted-foreground">
        Gerencie as informações do seu perfil pessoal
      </p>
      
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.image || ''} alt={user?.name || 'Avatar'} />
              <AvatarFallback>
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user?.name || 'Sem nome'}</CardTitle>
              <CardDescription>{user?.email || 'Sem email'}</CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">ID do usuário</h3>
              <p className="text-sm">{user?.id || 'Não disponível'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Perfil</h3>
              <p className="text-sm capitalize">{activeOrganization?.role?.toLowerCase() || 'Usuário'}</p>
            </div>
          </CardContent>
          
          <CardFooter>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}