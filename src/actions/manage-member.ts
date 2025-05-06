'use server'

import { db } from "@/lib/db"
import { currentUser } from "@/lib/auth"
import { MemberRole } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { canPerformAction } from "@/lib/rbac"

interface ChangeMemberRoleParams {
  membershipId: string
  role: MemberRole
}

interface RemoveMemberParams {
  membershipId: string
}

export async function changeMemberRole({
  membershipId,
  role
}: ChangeMemberRoleParams) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { error: "Não autorizado" }
    }

    // Buscar a associação para obter o ID da organização
    const membership = await db.membership.findUnique({
      where: { id: membershipId },
      include: { organization: true }
    })

    if (!membership) {
      return { error: "Associação não encontrada" }
    }

    // Buscar a associação do usuário atual com a organização
    const userMembership = await db.membership.findFirst({
      where: {
        userId: user.id,
        organizationId: membership.organizationId
      }
    })

    if (!userMembership) {
      return { error: "Você não é membro desta organização" }
    }

    // Verificar permissão usando RBAC
    if (!canPerformAction(userMembership.role, 'member:update')) {
      return { error: "Você não tem permissão para alterar funções de membros" }
    }

    // Não permitir alterar a função de um OWNER se não for OWNER
    if (membership.role === "OWNER" && userMembership.role !== "OWNER") {
      return { error: "Apenas proprietários podem alterar outros proprietários" }
    }

    // NOVA REGRA: Apenas OWNER pode promover alguém a OWNER
    if (role === "OWNER" && userMembership.role !== "OWNER") {
      return { error: "Apenas proprietários podem promover membros a proprietários" }
    }

    // NOVA REGRA: Verificar se já existe um OWNER na organização antes de promover alguém
    if (role === "OWNER" && membership.role !== "OWNER") {
      // Contar quantos proprietários a organização tem
      const ownersCount = await db.membership.count({
        where: {
          organizationId: membership.organizationId,
          role: "OWNER"
        }
      })

      // Se já existe um proprietário, impedir a promoção
      if (ownersCount >= 1) {
        return { error: "Não é possível promover este membro a PROPRIETÁRIO pois a organização já possui um proprietário" }
      }
    }

    // Verificar se o usuário está tentando alterar seu próprio papel de OWNER para outro
    if (
      membership.userId === user.id && 
      membership.role === "OWNER" && 
      role !== "OWNER"
    ) {
      // Contar quantos proprietários a organização tem
      const ownersCount = await db.membership.count({
        where: {
          organizationId: membership.organizationId,
          role: "OWNER"
        }
      })

      // Se o usuário é o único proprietário, impedir a alteração
      if (ownersCount <= 1) {
        return { error: "Não é possível alterar sua função de PROPRIETÁRIO pois você é o único proprietário da organização" }
      }
    }

    // Atualizar a função do membro
    await db.membership.update({
      where: { id: membershipId },
      data: { role }
    })

    revalidatePath(`/dashboard/${membership.organization.id}/members`)
    return { success: "Função do membro atualizada com sucesso" }
  } catch (error) {
    console.error("Erro ao alterar função:", error)
    return { error: "Ocorreu um erro ao alterar a função do membro" }
  }
}

export async function removeMember({
  membershipId
}: RemoveMemberParams) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { error: "Não autorizado" }
    }

    // Buscar a associação para obter o ID da organização
    const membership = await db.membership.findUnique({
      where: { id: membershipId },
      include: { organization: true }
    })

    if (!membership) {
      return { error: "Associação não encontrada" }
    }

    // Buscar a associação do usuário atual com a organização
    const userMembership = await db.membership.findFirst({
      where: {
        userId: user.id,
        organizationId: membership.organizationId
      }
    })

    if (!userMembership) {
      return { error: "Você não é membro desta organização" }
    }

    // Verificar permissão usando RBAC
    if (!canPerformAction(userMembership.role, 'member:remove')) {
      return { error: "Você não tem permissão para remover membros" }
    }

    // Não permitir remover um OWNER a menos que o usuário atual seja OWNER
    if (membership.role === "OWNER" && userMembership.role !== "OWNER") {
      return { error: "Apenas proprietários podem remover outros proprietários" }
    }

    // Contar quantos proprietários a organização tem
    const ownersCount = await db.membership.count({
      where: {
        organizationId: membership.organizationId,
        role: "OWNER"
      }
    })

    // Se estiver tentando remover o último proprietário, impedir
    if (membership.role === "OWNER" && ownersCount <= 1) {
      return { error: "Não é possível remover o último proprietário da organização" }
    }

    // Remover o membro
    await db.membership.delete({
      where: { id: membershipId }
    })

    revalidatePath(`/dashboard/${membership.organization.id}/members`)
    return { success: "Membro removido com sucesso" }
  } catch (error) {
    console.error("Erro ao remover membro:", error)
    return { error: "Ocorreu um erro ao remover o membro" }
  }
}