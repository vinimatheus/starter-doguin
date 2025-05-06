import { Toaster } from '@/components/ui/sonner'
import { SessionProvider } from 'next-auth/react'
import { auth } from '@/auth'
import { OrganizationProvider } from '@/providers/organization-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import KBar from '@/components/kbar'
import { SidebarInset } from '@/components/ui/sidebar'

export default async function CreateOrganizationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <KBar>
          <SidebarInset>

            <OrganizationProvider>
              {children}
              <Toaster />

            </OrganizationProvider>
          </SidebarInset>
        </KBar>
      </ThemeProvider>
    </SessionProvider>
  )
} 