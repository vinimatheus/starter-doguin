import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { canPerformAction, RBACAction } from '@/lib/rbac'
import { MemberRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const page = searchParams.get('page')
    
    if (!organizationId || !page) {
      return NextResponse.json({ 
        error: 'ID da organização e página são parâmetros obrigatórios' 
      }, { status: 400 })
    }
    
    // Verificar autenticação
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ 
        hasPermission: false,
        error: 'Não autenticado' 
      }, { status: 401 })
    }
    
    // Buscar a organização e a associação do usuário
    const organization = await db.organization.findFirst({
      where: { id: organizationId },
      include: {
        memberships: {
          where: { userId: session.user.id },
          select: { role: true }
        }
      }
    })
    
    if (!organization || organization.memberships.length === 0) {
      return NextResponse.json({ 
        hasPermission: false,
        error: 'Organização não encontrada ou você não é membro' 
      }, { status: 404 })
    }
    
    const userRole = organization.memberships[0].role as MemberRole
    
    // Verificar permissão com base na página solicitada
    let requiredPermission: RBACAction | null = null;
    
    switch (page) {
      case 'organization':
        requiredPermission = 'organization:update' as RBACAction
        break
      case 'subscription':
        requiredPermission = 'subscription:view' as RBACAction
        break
      case 'members':
        requiredPermission = 'member:view' as RBACAction
        break
      // Outras páginas restritas podem ser adicionadas aqui
      default:
        // Páginas como profile e preferences não exigem permissões especiais
        return NextResponse.json({ hasPermission: true })
    }
    
    const hasPermission = requiredPermission 
      ? canPerformAction(userRole, requiredPermission) 
      : true
    
    return NextResponse.json({ hasPermission })
    
  } catch (error) {
    console.error('Erro ao verificar permissões:', error)
    return NextResponse.json({ 
      hasPermission: false,
      error: 'Erro ao verificar permissões' 
    }, { status: 500 })
  }
}