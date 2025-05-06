'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { MemberRole } from '@prisma/client'
import { canPerformAction } from '@/lib/rbac'
import { OrganizationSchema } from '@/schemas'

/**
 * Cria uma nova organização e adiciona o usuário atual como proprietário
 */
export async function createOrganization(
  name: string,
  description?: string
) {
  try {
    const session = await auth()
    
    if (!session || !session.user || !session.user.id) {
      return { error: 'Não autorizado. Você precisa estar autenticado.' }
    }

    // Validar entrada
    const validatedFields = OrganizationSchema.safeParse({
      name,
      description
    })

    if (!validatedFields.success) {
      return { error: 'Dados de organização inválidos.' }
    }

    const { name: validatedName, description: validatedDescription } = validatedFields.data

    // Garantir que o userId é uma string válida
    const userId = session.user.id
    if (!userId) {
      return { error: 'ID de usuário inválido.' }
    }

    // Criar a organização e adicionar o usuário como proprietário em uma transação
    const organization = await db.$transaction(async (tx) => {
      // Criar organização
      const newOrganization = await tx.organization.create({
        data: {
          name: validatedName,
          description: validatedDescription
        }
      })

      // Adicionar usuário como proprietário
      await tx.membership.create({
        data: {
          userId: userId,
          organizationId: newOrganization.id,
          role: MemberRole.OWNER
        }
      })

      return newOrganization
    })

    revalidatePath('/dashboard')
    return { success: true, organization }
  } catch (error) {
    console.error('Erro ao criar organização:', error)
    return { error: `Erro ao criar organização. ${error}` }
  }
}

/**
 * Obtém as organizações do usuário atual
 */
export async function getUserOrganizations() {
  try {
    const session = await auth()
    
    if (!session || !session.user || !session.user.id) {
      return { error: 'Não autorizado. Você precisa estar autenticado.' }
    }

    const userWithOrganizations = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        memberships: {
          select: {
            id: true,
            role: true,
            organization: {
              select: {
                id: true,
                name: true,
                description: true,
                logo: true
              }
            }
          }
        }
      }
    })

    if (!userWithOrganizations) {
      return { error: 'Usuário não encontrado' }
    }

    return { 
      success: true, 
      organizations: userWithOrganizations.memberships.map(membership => ({
        ...membership.organization,
        role: membership.role
      }))
    }
  } catch (error) {
    console.error('Erro ao buscar organizações:', error)
    return { error: `Erro ao buscar organizações. ${error}` }
  }
}

/**
 * Obtém uma organização pelo ID
 */
export async function getOrganizationById(id: string) {
  try {
    const session = await auth()
    
    if (!session || !session.user || !session.user.id) {
      return { error: 'Não autorizado. Você precisa estar autenticado.' }
    }

    // Buscar organização e verificar se o usuário é membro
    const organization = await db.organization.findUnique({
      where: { id },
      include: {
        memberships: {
          where: { userId: session.user.id },
          select: { role: true }
        }
      }
    })

    if (!organization) {
      return { error: 'Organização não encontrada' }
    }

    // Verificar se o usuário é membro da organização
    if (organization.memberships.length === 0) {
      return { error: 'Acesso negado. Você não é membro desta organização.' }
    }

    // Retornar organização com a função do usuário
    return { 
      success: true, 
      organization: {
        id: organization.id,
        name: organization.name,
        description: organization.description,
        logo: organization.logo,
        role: organization.memberships[0].role
      }
    }
  } catch (error) {
    console.error('Erro ao buscar organização:', error)
    return { error: `Erro ao buscar organização. ${error}` }
  }
}

/**
 * Adiciona um membro à organização
 */
export async function addOrganizationMember(
  organizationId: string,
  email: string,
  role: MemberRole = MemberRole.MEMBER
) {
  try {
    const session = await auth()
    
    if (!session || !session.user || !session.user.id) {
      return { error: 'Não autorizado. Você precisa estar autenticado.' }
    }

    // Verificar se o usuário atual é admin ou owner da organização
    const currentUserMembership = await db.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId
        }
      }
    })

    if (!currentUserMembership) {
      return { error: 'Você não é membro desta organização' }
    }
    
    // Verificar permissão usando RBAC
    if (!canPerformAction(currentUserMembership.role, 'member:invite')) {
      return { error: 'Acesso negado. Você não tem permissão para adicionar membros.' }
    }

    // Verificar se o usuário a ser adicionado existe
    const userToAdd = await db.user.findUnique({
      where: { email }
    })

    if (!userToAdd) {
      return { error: 'Usuário não encontrado. O email informado não está registrado.' }
    }

    // Verificar se o usuário já é membro
    const existingMembership = await db.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: userToAdd.id,
          organizationId
        }
      }
    })

    if (existingMembership) {
      return { error: 'Este usuário já é membro desta organização.' }
    }

    // Adicionar o usuário como membro
    await db.membership.create({
      data: {
        userId: userToAdd.id,
        organizationId,
        role
      }
    })

    revalidatePath(`/dashboard/${organizationId}`)
    return { success: true }
  } catch (error) {
    console.error('Erro ao adicionar membro:', error)
    return { error: `Erro ao adicionar membro. ${error}` }
  }
}

/**
 * Remove um membro da organização
 */
export async function removeOrganizationMember(
  organizationId: string,
  memberId: string
) {
  try {
    const session = await auth()
    
    if (!session || !session.user || !session.user.id) {
      return { error: 'Não autorizado. Você precisa estar autenticado.' }
    }

    // Buscar a organização com seus membros
    const organization = await db.organization.findUnique({
      where: { id: organizationId },
      include: {
        memberships: true
      }
    })

    if (!organization) {
      return { error: 'Organização não encontrada' }
    }

    // Verificar se o usuário atual é admin ou owner da organização
    const currentUserMembership = organization.memberships.find(
      m => m.userId === session.user.id
    )

    if (!currentUserMembership) {
      return { error: 'Você não é membro desta organização' }
    }
    
    // Verificar permissão usando RBAC
    if (!canPerformAction(currentUserMembership.role, 'member:remove')) {
      return { error: 'Acesso negado. Você não tem permissão para remover membros.' }
    }

    // Buscar o membro a ser removido
    const memberToRemove = await db.membership.findUnique({
      where: { id: memberId },
      include: { user: true }
    })

    if (!memberToRemove) {
      return { error: 'Membro não encontrado.' }
    }

    // Impedir a remoção do último proprietário
    if (memberToRemove.role === MemberRole.OWNER) {
      const ownersCount = organization.memberships.filter(
        m => m.role === MemberRole.OWNER
      ).length

      if (ownersCount <= 1) {
        return { error: 'Não é possível remover o último proprietário da organização.' }
      }
    }

    // Remover o membro
    await db.membership.delete({
      where: { id: memberId }
    })

    revalidatePath(`/dashboard/${organizationId}`)
    return { success: true }
  } catch (error) {
    console.error('Erro ao remover membro:', error)
    return { error: `Erro ao remover membro. ${error}` }
  }
}