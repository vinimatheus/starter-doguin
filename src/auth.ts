import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { UserRole, User } from '@prisma/client'

import { getUserById } from '@/data/user'
import { db } from '@/lib/db'
import authConfig from '@/auth.config'

// Cache para usuários (TTL de 5 minutos)
const userCache = new Map<string, { user: User & { isOAuth: boolean }, timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos em milissegundos

// Função auxiliar para limpar cache antigo
const cleanupCache = () => {
  const now = Date.now()
  for (const [key, value] of userCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      userCache.delete(key)
    }
  }
}

// Executar limpeza do cache a cada 5 minutos
setInterval(cleanupCache, CACHE_TTL)

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  events: {
    async linkAccount({ user }) {
      if (!user.id) return
      
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      })
      // Limpar cache do usuário quando houver atualização
      userCache.delete(user.id)
    }
  },

  callbacks: {
    async signIn({ user, account }) {
      try {
        if (!user?.id && account?.provider !== 'credentials') {
          if (user.email) {
            const existingUser = await db.user.findUnique({
              where: { email: user.email },
              select: { id: true, emailVerified: true } // Selecionar apenas campos necessários
            })

            if (!existingUser) {
              console.log('Criando novo usuário para:', user.email)

              await db.user.create({
                data: {
                  name: user.name ?? user.email?.split('@')[0] ?? 'Usuário',
                  email: user.email ?? '',
                  emailVerified: new Date(),
                  image: typeof user.image === 'string' ? user.image : null
                },
                select: { id: true } // Selecionar apenas o ID
              })

              console.log('Usuário criado com sucesso:', user.email)
              return true
            }

            if (!existingUser.emailVerified) {
              await db.user.update({
                where: { id: existingUser.id },
                data: { emailVerified: new Date() }
              })
              // Limpar cache do usuário quando houver atualização
              userCache.delete(existingUser.id)
            }

            return true
          }

          return false
        }

        if (account?.provider !== 'credentials') return true

        const existingUser = await getUserById(user.id ?? '')

        if (!existingUser?.emailVerified) return false

        return true
      } catch (error) {
        console.error('Erro no signIn callback:', error)
        return false
      }
    },

    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole
      }

      if (session.user) {
        session.user.name = token.name
        session.user.email = token.email ?? ''
        session.user.isOAuth = token.isOAuth as boolean
        session.user.isValid = token.isValid !== false
      }

      return session
    },

    async jwt({ token }) {
      if (!token.sub) return token

      // Verificar cache primeiro
      const cachedUser = userCache.get(token.sub)
      const now = Date.now()

      if (cachedUser && (now - cachedUser.timestamp < CACHE_TTL)) {
        const existingUser = cachedUser.user
        token.name = existingUser.name
        token.email = existingUser.email
        token.picture = existingUser.image
        token.role = existingUser.role
        token.isOAuth = existingUser.isOAuth
        token.isValid = true
        return token
      }

      // Se não estiver em cache, buscar do banco
      const existingUser = await getUserById(token.sub)

      if (!existingUser) {
        console.warn('Usuário não encontrado no banco após login, marcando token como inválido')
        token.isValid = false
        return token
      }

      const oauthAccount = await db.account.findFirst({
        where: { userId: existingUser.id },
        select: { id: true } // Selecionar apenas o ID
      })

      // Atualizar cache
      userCache.set(token.sub, {
        user: {
          ...existingUser,
          isOAuth: !!oauthAccount
        },
        timestamp: now
      })

      token.name = existingUser.name
      token.email = existingUser.email
      token.picture = existingUser.image
      token.role = existingUser.role
      token.isOAuth = !!oauthAccount
      token.isValid = true

      return token
    }
  },

  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  trustHost: true,
  ...authConfig
})
