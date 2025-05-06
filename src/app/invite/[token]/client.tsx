'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { AlertCircle, Loader2, LogOut } from "lucide-react"
import { acceptInvite, loadInvitation } from "./_actions"
import { toast } from "sonner"
import { signOut } from "next-auth/react"

// Definindo tipos para melhorar a tipagem
interface User {
  email: string;
  id: string;
}

interface Organization {
  name: string;
  id: string;
}

interface Invitation {
  email: string;
  role: string;
  organization: Organization;
}

interface ClientInvitePageProps {
  token: string;
}

interface InvitationResult {
  success?: boolean;
  error?: string;
  invitation?: Invitation;
  user?: User;
}

interface AcceptInviteResult {
  success?: boolean;
  error?: string;
  redirect?: boolean;
  url?: string;
}

// Componente cliente que usa hooks do React
export default function ClientInvitePage({ token }: ClientInvitePageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Função para lidar com o logout
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      // Configurar o redirecionamento de volta para a página do convite
      await signOut({ 
        redirect: false 
      })
      // Após o logout bem-sucedido, recarregar a página para verificar o estado
      window.location.href = `/invite/${token}`
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      toast.error("Erro ao sair da conta")
      setIsSigningOut(false)
    }
  }

  // Utilizando useCallback para a função handleAcceptInvite para poder referenciá-la no useEffect
  const handleAcceptInvite = useCallback(async () => {
    try {
      setIsLoading(true)
      console.log("Iniciando processo de aceitar convite com token:", token)
      
      const formData = new FormData()
      formData.append('token', token)
      
      const result = await acceptInvite(formData) as AcceptInviteResult
      console.log("Resultado da ação de aceitar convite:", result)
      
      if (result.error) {
        console.log("Erro ao aceitar convite:", result.error)
        toast.error(result.error)
        setIsLoading(false)
        return
      }
      
      if (result.redirect && result.url) {
        // Se temos uma URL de redirecionamento, vamos para ela
        console.log("Redirecionando para:", result.url)
        router.push(result.url)
        return
      }
      
      if (result.success) {
        console.log("Convite aceito com sucesso")
        toast.success("Convite aceito com sucesso!")
        if (result.url) {
          console.log("Redirecionando após sucesso para:", result.url)
          router.push(result.url)
        }
      }
    } catch (error) {
      console.error("Erro ao aceitar convite:", error)
      toast.error("Ocorreu um erro ao aceitar o convite")
    } finally {
      setIsLoading(false)
    }
  }, [token, router]);

  useEffect(() => {
    // Função para carregar os dados do convite
    async function fetchInvitation() {
      try {
        setIsLoading(true)
        const result = await loadInvitation(token) as InvitationResult
        
        if (result.error) {
          setError(result.error)
        } else if (result.success && result.invitation) {
          setInvitation(result.invitation)
          setUser(result.user || null)
          
          // Se o usuário estiver autenticado e o email corresponder, aceitar automaticamente
          if (result.user && result.invitation && result.user.email === result.invitation.email) {
            handleAcceptInvite()
          }
        }
      } catch (error) {
        console.error("Erro ao carregar convite:", error)
        setError("Não foi possível carregar os detalhes do convite")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchInvitation()
  }, [token, handleAcceptInvite]);

  // Função para cancelar e voltar para a dashboard
  const handleCancel = () => {
    router.push('/dashboard')
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-4">
          <Card className="shadow-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Convite inválido</CardTitle>
              <CardDescription>
                {error}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/dashboard" className="w-full">
                <Button className="w-full" variant="outline">
                  Voltar para o Dashboard
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  if (!invitation || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando convite...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Card className="shadow-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Convite para organização</CardTitle>
            <CardDescription>
              Você foi convidado para se juntar à organização <strong>{invitation.organization.name}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && user.email !== invitation.email ? (
              <div className="bg-amber-50 text-amber-700 p-4 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Email diferente</h3>
                  <p className="text-sm mt-1">
                    Você está logado com o email <strong>{user.email}</strong>, mas este convite foi enviado para <strong>{invitation.email}</strong>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">E-mail:</span> {invitation.email}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Função:</span> {invitation.role}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Organização:</span> {invitation.organization.name}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            {user && user.email !== invitation.email ? (
              <div className="w-full space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  {isSigningOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saindo...
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair e entrar com outro email
                    </>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full mt-2"
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <div className="w-full space-y-2">
                <Button 
                  className="w-full" 
                  disabled={isLoading}
                  onClick={handleAcceptInvite}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    user ? 'Aceitar convite' : 'Continuar'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
              </div>
            )}
            
            <div className="text-xs text-center text-gray-500 mt-2">
              {!user && (
                <>
                  ou{" "}
                  <Link href={`/auth/login?callbackUrl=/invite/${token}`} className="text-blue-500 hover:underline">
                    faça login
                  </Link>{" "}
                  se já possui uma conta
                </>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 