'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

export default function ForceLogoutPage() {
  const searchParams = useSearchParams()
  const encodedReason = searchParams.get('reason')
  const reason = encodedReason 
    ? Buffer.from(encodedReason, 'base64').toString('utf-8')
    : 'Sessão inválida ou expirada.'

  useEffect(() => {
    // Forçar logout assim que a página carregar
    signOut({ callbackUrl: '/auth/login' })
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="text-2xl font-bold text-destructive mb-2">Você foi desconectado</h1>
      <p className="text-muted-foreground max-w-md">
        {reason}
      </p>
      <p className="mt-4 text-sm text-muted-foreground">Redirecionando para o login...</p>
    </div>
  )
}
