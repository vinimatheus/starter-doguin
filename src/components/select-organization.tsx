'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { acceptInvite } from '@/actions/accept-invite';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Check, Building2, Users } from 'lucide-react';
import { MemberRole } from '@prisma/client';

// Tipo para a organização
type Organization = {
  id: string;
  name: string;
  logo?: string | null;
}

// Tipo para a associação a uma organização
type Membership = {
  id: string;
  role: string | MemberRole;
  organization: Organization;
}

// Tipo para um convite
type Invitation = {
  id: string;
  role: string | MemberRole;
  organization: Organization;
}

interface SelectOrganizationProps {
  memberships: Membership[];
  invitations: Invitation[];
}

export function SelectOrganization({ memberships, invitations }: SelectOrganizationProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  // Função para entrar em uma organização existente
  const handleEnterOrganization = (organizationId: string) => {
    router.push(`/dashboard/${organizationId}/overview`);
  };

  // Função para aceitar um convite
  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      setIsLoading(prev => ({ ...prev, [invitationId]: true }));

      const result = await acceptInvite(invitationId);

      if (result.success) {
        toast.success('Convite aceito com sucesso!');
        // Redirecionar para o dashboard da organização
        router.push(result.redirectUrl);
      } else {
        toast.error(result.error || 'Erro ao aceitar convite');
      }
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      toast.error('Ocorreu um erro ao tentar aceitar o convite');
    } finally {
      setIsLoading(prev => ({ ...prev, [invitationId]: false }));
    }
  };

  // Função para criar nova organização
  const handleCreateOrganization = () => {
    router.push('/create-organization');
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="text-2xl">Selecione uma organização</CardTitle>
        <CardDescription>
          Escolha uma organização para acessar ou aceite convites pendentes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={memberships.length > 0 ? "organizations" : "invitations"}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="organizations">
              <Building2 className="mr-2 h-4 w-4" />
              Minhas Organizações
              {memberships.length > 0 && (
                <Badge variant="secondary" className="ml-2">{memberships.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="invitations">
              <Users className="mr-2 h-4 w-4" />
              Convites
              {invitations.length > 0 && (
                <Badge variant="secondary" className="ml-2">{invitations.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organizations" className="space-y-4">
            {memberships.length > 0 ? (
              <div className="grid gap-4">
                {memberships.map((membership) => (
                  <Button variant="outline" key={membership.id} onClick={() => handleEnterOrganization(membership.organization.id)}>
                    <Building2 size={20} />
                    <h3 className="font-medium">{membership.organization.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      Função: {typeof membership.role === 'string'
                        ? membership.role.toLowerCase()
                        : String(membership.role).toLowerCase()
                      }
                    </p>
                  </Button>

                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma organização encontrada</h3>
                <p className="text-muted-foreground mb-6">
                  Você não faz parte de nenhuma organização ainda
                </p>
                <Button onClick={handleCreateOrganization}>
                  Criar uma organização
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="invitations" className="space-y-4">
            {invitations.length > 0 ? (
              <div className="grid gap-4">
                {invitations.map((invitation) => (
                  <Card key={invitation.id} className="bg-muted/40">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                            <Building2 size={20} />
                          </div>
                        <div>
                          <h3 className="font-medium">{invitation.organization.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            Função: {typeof invitation.role === 'string'
                              ? invitation.role.toLowerCase()
                              : String(invitation.role).toLowerCase()
                            }
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAcceptInvitation(invitation.id)}
                        disabled={isLoading[invitation.id]}
                      >
                        {isLoading[invitation.id] ? (
                          "Aceitando..."
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Aceitar
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum convite pendente</h3>
                <p className="text-muted-foreground mb-6">
                  Você não tem convites pendentes para nenhuma organização
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 