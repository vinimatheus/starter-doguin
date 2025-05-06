import { auth } from '@/auth'
import { Toaster } from '@/components/ui/sonner'
import AppSidebarWrapper from '@/components/layout/app-sidebar-wrapper'
import Header from '@/components/layout/header'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { OrganizationProvider } from '@/providers/organization-provider'
import { SessionProvider } from 'next-auth/react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { cookies } from 'next/headers'
import KBar from '@/components/kbar'

// Configuração de cache para o layout
export const revalidate = 300 // 5 minutos

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  // Se não houver sessão, o middleware já terá redirecionado
  if (!session) {
    return null
  }

  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <OrganizationProvider>
          <KBar>
            <SidebarProvider defaultOpen={defaultOpen}>
              <AppSidebarWrapper />
              <SidebarInset>
                <Header />
                {children}
              </SidebarInset>
            </SidebarProvider>
            <Toaster />
          </KBar>
        </OrganizationProvider>
      </ThemeProvider>
    </SessionProvider>
  )
} 