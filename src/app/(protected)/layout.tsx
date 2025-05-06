import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { OrganizationProvider } from '@/providers/organization-provider'
import { Toaster } from '@/components/ui/sonner'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Se não estiver logado
  if (!session?.user) {
    return redirect('/auth/login')
  }

  // Se o token foi marcado como inválido (usuário removido do banco)
  if (session.user.isValid === false) {
    const message = Buffer.from('Usuário removido do sistema').toString('base64')
    return redirect(`/auth/force-logout?reason=${message}`)
  }

  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <OrganizationProvider>
          {children}
          <Toaster />
        </OrganizationProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
