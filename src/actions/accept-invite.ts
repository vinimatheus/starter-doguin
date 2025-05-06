'use server';

import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function acceptInvite(invitationId: string) {
  try {
    const user = await currentUser();
    
    if (!user?.id || !user?.email) {
      return { error: 'Não autorizado' };
    }
    
    // Buscar o convite
    const invitation = await db.invitation.findUnique({
      where: {
        id: invitationId,
        email: user.email,
        expiresAt: {
          gt: new Date() // Verificar se não expirou
        }
      },
      include: {
        organization: true
      }
    });
    
    if (!invitation) {
      return { error: 'Convite não encontrado ou expirado' };
    }
    
    // Verificar se o usuário já é membro da organização
    const existingMembership = await db.membership.findFirst({
      where: {
        userId: user.id,
        organizationId: invitation.organizationId
      }
    });
    
    if (existingMembership) {
      // Atualizar a função do usuário, se necessário
      await db.membership.update({
        where: {
          id: existingMembership.id
        },
        data: {
          role: invitation.role
        }
      });
    } else {
      // Criar uma nova associação à organização
      await db.membership.create({
        data: {
          userId: user.id,
          organizationId: invitation.organizationId,
          role: invitation.role
        }
      });
    }
    
    // Remover o convite após aceitá-lo
    await db.invitation.delete({
      where: {
        id: invitation.id
      }
    });
    
    // Revalidar caminhos relevantes
    revalidatePath('/select-organization');
    revalidatePath(`/dashboard/${invitation.organization.id}/members`);
    
    return { 
      success: 'Convite aceito com sucesso',
      redirectUrl: `/dashboard/${invitation.organization.id}/overview`
    };
  } catch (error) {
    console.error('Erro ao aceitar convite:', error);
    return { error: 'Erro ao aceitar convite' };
  }
} 