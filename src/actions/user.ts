'use server';

import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import * as z from 'zod';
import { ProfileSchema } from '@/schemas';
import { getUserByEmail, getUserById } from '@/data/user';
import bcrypt from 'bcrypt';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/mail';

export async function checkUserHasOAuthAccount(userId: string) {
  try {
    // Verificar se temos acesso ao usuário atual
    const user = await currentUser();
    
    // Se o usuário atual tiver a propriedade isOAuth e o ID corresponder, use essa informação
    if (user && user.id === userId && 'isOAuth' in user) {
      const provider = await db.account.findFirst({
        where: { userId },
        select: { provider: true }
      });
      
      return { 
        isOAuth: user.isOAuth, 
        provider: provider?.provider 
      };
    }
    
    // Caso contrário, consulte o banco de dados
    const account = await db.account.findFirst({
      where: { userId }
    });

    return { isOAuth: !!account, provider: account?.provider };
  } catch (error) {
    console.error('Erro ao verificar conta OAuth:', error);
    return { error: 'Erro ao verificar conta' };
  }
}

export async function updateProfile(values: z.infer<typeof ProfileSchema>) {
  try {
    console.log('Iniciando updateProfile com valores:', values);
    const user = await currentUser();

    if (!user) {
      console.log('Usuário não autenticado');
      return { error: 'Não autorizado!' };
    }

    const dbUser = await getUserById(user.id as string);

    if (!dbUser) {
      console.log('Usuário não encontrado no banco:', user.id);
      return { error: 'Usuário não encontrado!' };
    }

    console.log('Usuário encontrado:', dbUser.id, dbUser.name);

    // Verificar se o email está sendo alterado
    if (values.email && values.email !== user.email) {
      console.log('Tentando alterar email:', user.email, '->', values.email);
      const existingUser = await getUserByEmail(values.email);

      if (existingUser && existingUser.id !== user.id) {
        console.log('Email já em uso por outro usuário');
        return { error: 'Email já está em uso!' };
      }

      // Enviar email de verificação para o novo endereço
      const verificationToken = await generateVerificationToken(values.email);
      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token
      );

      console.log('Atualizando nome e enviando verificação de email');
      await db.user.update({
        where: { id: dbUser.id },
        data: { name: values.name }
      });

      return { success: 'Nome atualizado e email de verificação enviado!' };
    }

    // Verificar se a senha está sendo alterada
    if (values.password && values.currentPassword) {
      console.log('Tentando alterar senha');
      // Verificar se o usuário usa autenticação OAuth
      const { isOAuth } = await checkUserHasOAuthAccount(user.id as string);
      
      if (isOAuth) {
        console.log('Usuário OAuth não pode alterar senha');
        return { error: 'Usuários com autenticação social não podem alterar a senha!' };
      }
      
      if (!dbUser.password) {
        console.log('Usuário sem senha no banco');
        return { error: 'Não é possível mudar a senha. Você usa autenticação social.' };
      }

      // Verificar senha atual
      const isPasswordValid = await bcrypt.compare(
        values.currentPassword,
        dbUser.password
      );

      if (!isPasswordValid) {
        console.log('Senha atual incorreta');
        return { error: 'Senha atual incorreta!' };
      }

      // Atualizar a senha
      const hashedPassword = await bcrypt.hash(values.password, 10);
      
      console.log('Atualizando nome e senha');
      await db.user.update({
        where: { id: dbUser.id },
        data: {
          name: values.name,
          password: hashedPassword
        }
      });

      return { success: 'Perfil e senha atualizados com sucesso!' };
    }

    // Apenas atualizar o nome
    console.log('Atualizando apenas o nome para:', values.name);
    const updatedUser = await db.user.update({
      where: { id: dbUser.id },
      data: { name: values.name }
    });
    
    console.log('Usuário atualizado com sucesso:', updatedUser.name);
    return { 
      success: 'Perfil atualizado com sucesso!',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email
      }
    };
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return { error: 'Erro ao atualizar perfil.' };
  }
}

export async function deleteAccount(password?: string) {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: 'Não autorizado!' };
    }

    // Verificar se o usuário usa autenticação OAuth
    const oauthAccount = await db.account.findFirst({
      where: { userId: user.id as string }
    });

    // Se não for conta OAuth, verificar a senha
    if (!oauthAccount && user.id) {
      // Se não forneceu senha
      if (!password || password.trim() === '') {
        return { error: 'É necessário fornecer sua senha para excluir a conta.' };
      }

      const dbUser = await getUserById(user.id);
      
      if (!dbUser?.password) {
        return { error: 'Configuração de conta inválida.' };
      }
      
      // Verificar se a senha está correta
      const isPasswordValid = await bcrypt.compare(password, dbUser.password);
      
      if (!isPasswordValid) {
        return { error: 'Senha incorreta. Por favor, tente novamente.' };
      }
    }

    // Verificar se o usuário é dono de alguma organização
    const ownerMemberships = await db.membership.findMany({
      where: { 
        userId: user.id as string,
        role: 'OWNER'
      },
      include: {
        organization: {
          include: {
            memberships: {
              select: {
                id: true
              }
            }
          }
        }
      }
    });

    // Array para armazenar organizações que não podem ser excluídas
    const orgsWithOtherMembers: string[] = [];
    // Array para armazenar IDs de organizações para excluir
    const orgsToDelete: string[] = [];

    // Verificar cada organização de propriedade do usuário
    for (const membership of ownerMemberships) {
      // Se a organização tiver apenas 1 membro (o próprio usuário), pode ser excluída
      if (membership.organization.memberships.length === 1) {
        orgsToDelete.push(membership.organization.id);
      } else {
        // Caso contrário, é necessário transferir a propriedade
        orgsWithOtherMembers.push(membership.organization.name);
      }
    }

    // Se houver organizações que não podem ser excluídas, impedir a exclusão
    if (orgsWithOtherMembers.length > 0) {
      const orgNames = orgsWithOtherMembers.join(', ');
      return { 
        error: `Você é proprietário das seguintes organizações com outros membros: ${orgNames}. Transfira a propriedade para outro membro antes de excluir sua conta.` 
      };
    }

    // Excluir as organizações que têm apenas o usuário como membro
    if (orgsToDelete.length > 0) {
      // Primeiro remover todos os convites pendentes
      await db.invitation.deleteMany({
        where: { organizationId: { in: orgsToDelete } }
      });

      // Depois remover as organizações
      await db.organization.deleteMany({
        where: { id: { in: orgsToDelete } }
      });
    }

    // Remover todas as memberships do usuário em organizações
    await db.membership.deleteMany({
      where: { userId: user.id as string }
    });

    // Remover todas as contas OAuth associadas
    await db.account.deleteMany({
      where: { userId: user.id as string }
    });

    // Remover todos os códigos de verificação
    await db.verificationCode.deleteMany({
      where: { userId: user.id as string }
    });

    // Finalmente excluir o usuário
    await db.user.delete({
      where: { id: user.id as string }
    });

    // Retornar sucesso - o frontend lidará com logout e redirecionamento
    return { 
      success: 'Conta excluída com sucesso!',
      shouldRedirect: true // Sinalizamos que o frontend deve redirecionar
    };
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    return { error: 'Erro ao excluir conta.' };
  }
} 