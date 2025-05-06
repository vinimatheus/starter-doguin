import { MemberRole } from '@prisma/client'

export interface Organization {
  id: string
  name: string
  slug: string
  description?: string | null
  logo?: string | null
  role: MemberRole
} 