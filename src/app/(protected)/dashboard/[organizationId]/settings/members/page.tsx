import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { MembersClient } from "./_components/members-client";
import { auth } from "@/auth";
import { canPerformAction } from "@/lib/rbac";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ organizationId: string }>
}) {
  const { organizationId } = await params;
  const session = await auth();
  
  if (!session?.user?.id) {
    return notFound();
  }

  try {
    const organization = await db.organization.findFirst({
      where: {
        id: organizationId,
      },
      include: {
        memberships: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        invitations: {
          orderBy: {
            createdAt: "desc",
          },
          where: {
            expiresAt: {
              gt: new Date(),
            },
          },
        },
      },
    });

    if (!organization) {
      return notFound();
    }

    // Encontrar o papel do usuário atual na organização
    const currentUserMembership = organization.memberships.find(
      (membership) => membership.user.id === session.user.id
    );

    if (!currentUserMembership) {
      return notFound();
    }

    // Verificar se o usuário tem permissão para ver membros
    const canViewMembers = canPerformAction(currentUserMembership.role, 'member:view');
    
    if (!canViewMembers) {
      // Redirecionar para perfil se não tiver permissão
      return redirect(`/dashboard/${organizationId}/settings/profile`);
    }

    const members = organization.memberships.map((membership) => ({
      id: membership.id,
      userId: membership.user.id,
      name: membership.user.name || "Usuário sem nome",
      email: membership.user.email || "",
      role: membership.role,
      image: membership.user.image,
      joinedAt: membership.createdAt.toISOString(),
    }));

    const invitations = organization.invitations.map((invitation) => ({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      sentAt: invitation.createdAt.toISOString(),
      expiresAt: invitation.expiresAt.toISOString(),
    }));

    return (
        <div>
          <h2 className="text-xl font-semibold mb-4">Membros</h2>
          <p className="mb-6 text-muted-foreground">
            Gerencie os membros da sua organização
          </p>
          
          <MembersClient
            organizationId={organization.id}
            members={members}
            invitations={invitations}
            currentUserRole={currentUserMembership.role}
          />
        </div>
    );
  } catch (error) {
    console.error("Erro ao carregar página de membros:", error);
    return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Erro ao carregar membros</h2>
            <p className="text-muted-foreground">Tente recarregar a página.</p>
          </div>
        </div>
    );
  }
} 