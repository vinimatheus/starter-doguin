import { MemberRole } from '@prisma/client'

export type RBACAction =
  | 'organization:view'
  | 'organization:update'
  | 'organization:delete'
  | 'member:invite'
  | 'member:remove'
  | 'member:update'
  | 'member:view'
  | 'subscription:view'

const rolePermissions: Record<MemberRole, RBACAction[]> = {
  OWNER: [
    'organization:view',
    'organization:update',
    'organization:delete',
    'member:invite',
    'member:remove',
    'member:update',
    'member:view',
    'subscription:view',
  ],
  ADMIN: [
    'organization:view',
    'organization:update',
    'member:invite',
    'member:remove',
    'member:update',
    'member:view',
  ],
  MEMBER: [
    'organization:view',
    'member:view',
  ],
}

export function canPerformAction(role: MemberRole, action: RBACAction): boolean {
  return rolePermissions[role]?.includes(action) ?? false
}