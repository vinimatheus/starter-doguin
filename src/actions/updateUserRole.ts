'use server';

import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { getUserById } from '@/data/user';
import { revalidatePath } from 'next/cache';

export type UserRole = 'ADMIN' | 'USER';

export const updateUserRole = async (userId: string, newRole: UserRole) => {
  try {
    // Verificar se o usuário atual está autenticado
    const user = await currentUser();

    if (!user) {
      return { error: 'Não autorizado!' };
    }

    // Verificar se o usuário atual é um administrador
    const dbUser = await getUserById(user.id as string);

    if (!dbUser) {
      return { error: 'Usuário não encontrado!' };
    }

    if (dbUser.role !== 'ADMIN') {
      return { error: 'Você não tem permissão para alterar funções!' };
    }

    // Atualizar a função do usuário
    await db.user.update({
      where: { id: userId },
      data: { role: newRole }
    });

    revalidatePath('/dashboard/users');

    return { success: 'Função do usuário atualizada com sucesso!' };
  } catch (error) {
    console.error('Erro ao atualizar função do usuário:', error);
    return { error: 'Ocorreu um erro ao atualizar a função do usuário.' };
  }
  
};