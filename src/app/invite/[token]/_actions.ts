'use server'

import { db } from "@/lib/db"
import { currentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function loadInvitation(token: string) {
  if (!token) {
    return { 
      error: "Token de convite inválido" 
    }
  }

  try {
    const invitation = await db.invitation.findUnique({
      where: {
        token,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        organization: true
      }
    })

    if (!invitation) {
      return { 
        error: "Convite não encontrado ou expirado" 
      }
    }

    const user = await currentUser()

    return {
      success: true,
      invitation,
      user
    }
  } catch (error) {
    console.error("Erro ao carregar convite:", error)
    return { 
      error: "Erro ao carregar dados do convite" 
    }
  }
}

export async function acceptInvite(formData: FormData) {
  try {
    const token = formData.get('token') as string

    if (!token) {
      return { error: "Token inválido" }
    }

    // Buscar o convite
    const invitation = await db.invitation.findUnique({
      where: {
        token,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        organization: true
      }
    })

    if (!invitation) {
      return { error: "Convite não encontrado ou expirado" }
    }

    // Verificar se o usuário está autenticado
    const user = await currentUser()

    if (!user) {
      // Se o usuário não estiver autenticado, tentamos encontrar o usuário pelo email
      const existingUser = await db.user.findUnique({
        where: { email: invitation.email }
      })

      if (existingUser) {
        // Usuário existe mas não está logado
        // Em vez de redirecionar diretamente, retornamos uma resposta que o cliente pode usar
        console.log("Usuário existe, redirecionando para login");
        const redirectUrl = `/invite/${token}`;
        const loginUrl = `/auth/login?email=${encodeURIComponent(invitation.email)}&callbackUrl=${encodeURIComponent(redirectUrl)}`;
        
        return { 
          redirect: true,
          url: loginUrl
        };
      } else {
        // Usuário não existe, retornamos uma resposta para redirecionar no cliente
        console.log("Usuário não existe, redirecionando para registro");
        const registerUrl = `/auth/register?email=${encodeURIComponent(invitation.email)}&inviteToken=${token}&organization=${encodeURIComponent(invitation.organization.name)}&role=${invitation.role}`;
        
        return { 
          redirect: true,
          url: registerUrl
        };
      }
    }

    // Verificar se o email do usuário corresponde ao do convite
    if (user.email !== invitation.email) {
      // Se o usuário estiver logado com um email diferente do convite
      return {
        error: "Você está logado com um email diferente do convite. Por favor, faça login com a conta associada ao email do convite."
      }
    }

    // Verificar se o usuário já é membro da organização
    const existingMembership = await db.membership.findFirst({
      where: {
        userId: user.id,
        organizationId: invitation.organizationId
      }
    })

    if (existingMembership) {
      // Atualizar a função do usuário, se ele já for membro
      await db.membership.update({
        where: {
          id: existingMembership.id
        },
        data: {
          role: invitation.role
        }
      })
    } else {
      // Verificar que o user.id não é undefined
      if (!user.id) {
        return { error: "ID do usuário não encontrado" }
      }
      
      // Criar nova associação
      await db.membership.create({
        data: {
          userId: user.id,
          organizationId: invitation.organizationId,
          role: invitation.role
        }
      })
    }

    // Excluir o convite
    await db.invitation.delete({
      where: {
        id: invitation.id
      }
    })

    // Revalidar a página de membros
    revalidatePath(`/dashboard/${invitation.organization.id}/members`)

    // Retornar a URL para redirecionar no cliente
    return { 
      success: true,
      redirect: true,
      url: `/dashboard/${invitation.organization.id}/overview`
    }
  } catch (error) {
    console.error("Erro ao aceitar convite:", error)
    return { error: "Não foi possível aceitar o convite. Tente novamente." }
  }
} 