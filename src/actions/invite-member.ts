'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { MemberRole } from '@prisma/client'
import { canPerformAction } from '@/lib/rbac'
import { v4 as uuidv4 } from 'uuid'
import { revalidatePath } from 'next/cache'
import { Resend } from "resend"

const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const resend = new Resend(process.env.RESEND_API_KEY);
const emailFrom = process.env.EMAIL_FROM || 'noreply@seudoguin.com';

const emailTemplate = (
  title: string,
  description: string,
  actionText: string,
  link?: string
) => `
  <div style="
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: #FAFAFA;
    padding: 24px 0;
    text-align: center;
    color: #171717;
  ">
    <table border="0" cellspacing="0" cellpadding="0" align="center" style="
      max-width: 520px;
      width: 100%;
      background-color: #ffffff;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      border: 1px solid #E5E5E5;
    ">
      <tr>
        <td style="padding: 20px 24px; border-bottom: 1px solid #E5E5E5;">
          <h1 style="
            margin: 0;
            font-size: 16px;
            font-weight: 500;
            letter-spacing: -0.025em;
          ">
            ${title}
          </h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 24px; text-align: left;">
          <p style="
            margin: 0 0 16px;
            font-size: 14px;
            line-height: 1.5;
            color: #525252;
          ">
            ${description}
          </p>
          ${link ? `
          <div style="text-align: center; margin: 24px 0;">
            <a 
              href="${link}" 
              style="
                background: #171717;
                color: #ffffff;
                padding: 8px 16px;
                border-radius: 4px;
                text-decoration: none;
                font-size: 14px;
                font-weight: 400;
                display: inline-block;
              "
            >
              ${actionText}
            </a>
          </div>
          ` : `
          <div style="
            text-align: center;
            margin: 16px 0;
            padding: 12px;
            background-color: #F5F5F5;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
          ">
            ${actionText}
          </div>
          `}
          <p style="
            font-size: 13px;
            color: #737373;
            margin-top: 16px;
          ">
            Se você não fez esta solicitação, ignore este e-mail.
          </p>
        </td>
      </tr>
      <tr>
        <td style="background-color: #F5F5F5; padding: 12px; text-align: center; border-top: 1px solid #E5E5E5;">
          <p style="
            margin: 0;
            font-size: 12px;
            color: #737373;
          ">
            &copy; ${new Date().getFullYear()} 
            <span style="font-weight: 500;">Starter Doguin</span>. 
            Todos os direitos reservados.
          </p>
        </td>
      </tr>
    </table>
  </div>
`;

// Enviar um novo convite
export async function inviteMember({
  email,
  organizationId,
  role = 'MEMBER' as MemberRole
}: {
  email: string,
  organizationId: string,
  role: MemberRole
}) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { error: 'Não autorizado' }
    }

    if (!email || !organizationId) {
      return { error: 'Email e organizationId são obrigatórios' }
    }

    // Verificar se o usuário atual é membro da organização
    const currentUserMembership = await db.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId,
        },
      },
    })

    if (!currentUserMembership) {
      return { error: 'Você não é membro desta organização' }
    }
    
    // Verificar permissão usando RBAC
    if (!canPerformAction(currentUserMembership.role, 'member:invite')) {
      return { error: 'Você não tem permissão para convidar membros' }
    }

    // Verificar se o email já existe como membro
    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true }
    })

    if (existingUser) {
      const existingMembership = await db.membership.findUnique({
        where: {
          userId_organizationId: {
            userId: existingUser.id,
            organizationId,
          },
        },
      })

      if (existingMembership) {
        return { error: 'Este usuário já é membro da organização' }
      }
    }

    // Verificar se já existe um convite pendente para este email
    const existingInvitation = await db.invitation.findUnique({
      where: {
        email_organizationId: {
          email,
          organizationId,
        },
      },
    })

    if (existingInvitation) {
      return { error: 'Já existe um convite pendente para este email' }
    }

    // Definir uma data de expiração (por exemplo, 7 dias a partir de agora)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Criar o convite
    const invitation = await db.invitation.create({
      data: {
        email,
        organizationId,
        role,
        token: uuidv4(),
        expiresAt,
      },
    })

    // Buscar informações da organização
    const organization = await db.organization.findUnique({
      where: { id: organizationId }
    })

    if (!organization) {
      return { error: 'Organização não encontrada' }
    }

    // Montar URL de confirmação
    const confirmationUrl = `${domain}/invite/${invitation.token}`
    
    console.log("URL de confirmação:", confirmationUrl);

    // Criar HTML do email usando o template padrão
    const html = emailTemplate(
      `Convite para ${organization.name}`,
      `Você foi convidado para se juntar à organização ${organization.name} como ${getRoleName(role)}.`,
      'Aceitar Convite',
      confirmationUrl
    );

    // Enviar email com Resend
    const result = await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: `Convite para se juntar a ${organization.name}`,
      html: html
    });
    
    console.log("Resultado do envio de e-mail:", result);

    revalidatePath(`/dashboard/${organization.id}/settings/members`)
    return { success: 'Convite enviado com sucesso' }
  } catch (error) {
    console.error('Erro ao enviar convite:', error)
    return { error: 'Erro ao processar a solicitação' }
  }
}

// Reenviar um convite existente
export async function resendInvitation(invitationId: string) {
  try {
    if (!invitationId) {
      return { error: 'ID do convite não fornecido' }
    }

    const session = await auth()

    if (!session?.user?.id) {
      return { error: 'Não autorizado' }
    }

    // Buscar o convite pelo ID
    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
      include: {
        organization: {
          include: {
            memberships: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    })

    if (!invitation) {
      return { error: 'Convite não encontrado' }
    }

    // Verificar se o usuário atual tem permissão para reenviar convites
    if (
      invitation.organization.memberships.length === 0 ||
      (invitation.organization.memberships[0].role !== MemberRole.ADMIN &&
        invitation.organization.memberships[0].role !== MemberRole.OWNER)
    ) {
      return { error: 'Você não tem permissão para reenviar convites' }
    }

    // Atualizar a data de expiração e gerar um novo token
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await db.invitation.update({
      where: { id: invitationId },
      data: {
        token: uuidv4(),
        expiresAt,
      },
    })

    // Buscar informações da organização
    const organization = await db.organization.findUnique({
      where: { id: invitation.organizationId }
    })

    if (!organization) {
      return { error: 'Organização não encontrada' }
    }

    // Montar URL de confirmação
    const confirmationUrl = `${domain}/invite/${invitation.token}`

    // Criar HTML do email usando o template padrão
    const html = emailTemplate(
      `Convite para ${organization.name}`,
      `Você foi convidado para se juntar à organização ${organization.name} como ${getRoleName(invitation.role)}.`,
      'Aceitar Convite',
      confirmationUrl
    );

    // Reenviar email
    await resend.emails.send({
      from: emailFrom,
      to: invitation.email,
      subject: `Convite para se juntar a ${organization.name}`,
      html: html
    })

    revalidatePath(`/dashboard/${invitation.organization.id}/settings/members`)
    return { success: 'Convite reenviado com sucesso' }
  } catch (error) {
    console.error('Erro ao reenviar convite:', error)
    return { error: 'Erro ao processar a solicitação' }
  }
}

// Cancelar um convite
export async function cancelInvitation(invitationId: string) {
  try {
    if (!invitationId) {
      return { error: 'ID do convite não fornecido' }
    }

    const session = await auth()

    if (!session?.user?.id) {
      return { error: 'Não autorizado' }
    }

    // Buscar o convite pelo ID
    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
      include: {
        organization: {
          include: {
            memberships: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    })

    if (!invitation) {
      return { error: 'Convite não encontrado' }
    }

    // Verificar se o usuário atual tem permissão para cancelar convites
    if (
      invitation.organization.memberships.length === 0 ||
      (invitation.organization.memberships[0].role !== MemberRole.ADMIN &&
        invitation.organization.memberships[0].role !== MemberRole.OWNER)
    ) {
      return { error: 'Você não tem permissão para cancelar convites' }
    }

    // Excluir o convite
    await db.invitation.delete({
      where: { id: invitationId },
    })

    revalidatePath(`/dashboard/${invitation.organization.id}/settings/members`)
    return { success: 'Convite cancelado com sucesso' }
  } catch (error) {
    console.error('Erro ao cancelar convite:', error)
    return { error: 'Erro ao processar a solicitação' }
  }
}

// Função auxiliar para obter nome legível do papel
function getRoleName(role: MemberRole): string {
  switch (role) {
    case "OWNER": return "Proprietário";
    case "ADMIN": return "Administrador";
    case "MEMBER": return "Membro";
    default: return role;
  }
}