'use server';

import { db } from '@/lib/db';

export async function validateInvitation(token?: string | null, email?: string | null) {
  try {
    if (!token || !email) {
      return {
        valid: false,
        error: 'Token e email são obrigatórios'
      };
    }

    // Buscar convite no banco de dados
    const invitation = await db.invitation.findUnique({
      where: {
        token,
        email,
        expiresAt: {
          gt: new Date() // Verificamos se não expirou
        }
      },
      include: {
        organization: true
      }
    });

    if (!invitation) {
      return {
        valid: false,
        error: 'Convite não encontrado ou expirado'
      };
    }

    // Retornar as informações do convite
    return {
      valid: true,
      organization: invitation.organization.name,
      role: invitation.role
    };
  } catch (error) {
    console.error('Erro ao validar token de convite:', error);
    return {
      valid: false,
      error: 'Erro ao validar token de convite'
    };
  }
} 