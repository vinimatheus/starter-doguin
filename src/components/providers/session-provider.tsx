'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { type Session } from 'next-auth'

interface SessionProviderProps {
  children: React.ReactNode
  session: Session | null
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider
      session={session}
      refetchInterval={5 * 60} // 5 minutos
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      {children}
    </NextAuthSessionProvider>
  )
} 