'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganizationContext } from '@/providers/organization-provider'
import { Button } from '@/components/ui/button'
import { Dog, Loader2 } from 'lucide-react'
import { CreateOrganizationForm } from '@/components/organization/create-organization-form'
import { signOut } from 'next-auth/react'
import FormContainer from '@/components/layout/form-container'

export default function CreateOrganizationPage() {
  const { organizations, isLoading } = useOrganizationContext()
  const router = useRouter()
  const [openDialog, setOpenDialog] = useState(true)

  // Redirecionar para o dashboard se já tiver organizações
  useEffect(() => {
    if (!isLoading && organizations.length > 0) {
      router.push(`/dashboard/${organizations[0].id}/overview`)
    }
  }, [organizations, isLoading, router])

  // Fechar o diálogo redireciona para o login
  const handleCloseDialog = () => {
    setOpenDialog(false)
    // Ao cancelar, voltar para a página de login
    router.push('/auth/login')
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden bg-muted lg:block">
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Dog className="size-4" />
            </div>
            Doguin Starter
          </a>
        </div>
        <div className="flex ">
          <FormContainer>
            <CreateOrganizationForm
              open={openDialog}
              onOpenChange={setOpenDialog}
              onCancel={handleCloseDialog}
              isStandalone={true}
            />

            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-card px-2 text-muted-foreground">
                Ou
              </span>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => signOut()}
            >
              Sair e entrar com outra conta
            </Button>

            <div className="text-balance text-center text-xs text-muted-foreground">
              Ao criar uma organização, você concorda com nossos{' '}
              <a href="#" className="underline underline-offset-4 hover:text-primary">
                Termos de Serviço
              </a>{' '}
              e{' '}
              <a href="#" className="underline underline-offset-4 hover:text-primary">
                Política de Privacidade
              </a>.
            </div>
          </FormContainer>
        </div>
      </div>
    </div>


  )
} 