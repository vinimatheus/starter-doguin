import { UserRole } from '@prisma/client'
import { DefaultSession } from 'next-auth'

export type ExtendedUser = DefaultSession['user'] & {
  id: string
  role: UserRole
  isOAuth: boolean
  isValid?: boolean // <- ESSENCIAL para logout forçado
}

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser
  }
}
