import { redirect } from 'next/navigation';
import { SelectOrganization } from '@/components/select-organization';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { Dog } from 'lucide-react';
export default async function SelectOrganizationPage() {
  const user = await currentUser();

  if (!user) {
    return redirect('/auth/login');
  }

  // Verificar se o usuário tem um email (necessário para buscar convites)
  if (!user.email) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erro de autenticação</h1>
          <p>Sua conta não possui um email associado. Por favor, entre em contato com o suporte.</p>
        </div>
      </div>
    );
  }

  // Buscar organizações do usuário
  const memberships = await db.membership.findMany({
    where: {
      userId: user.id
    },
    include: {
      organization: true
    }
  });

  // Buscar convites pendentes
  const rawInvitations = await db.invitation.findMany({
    where: {
      email: user.email,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      organization: true
    }
  });

  // Converter convites para o formato esperado pelo componente
  const invitations = rawInvitations.map(invitation => ({
    id: invitation.id,
    role: invitation.role,
    organization: {
      id: invitation.organization.id,
      name: invitation.organization.name,
       logo: invitation.organization.logo
    }
  }));

  // Se o usuário não tem organizações nem convites, redirecionar para criar uma
  if (memberships.length === 0 && invitations.length === 0) {
    return redirect('/create-organization');
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">

      <div className="relative hidden bg-muted lg:block">

      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Dog className="size-4" />
            </div>
            Doguin Starter
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <SelectOrganization memberships={memberships} invitations={invitations} />
        </div>
      </div>
    </div>
  );
} 