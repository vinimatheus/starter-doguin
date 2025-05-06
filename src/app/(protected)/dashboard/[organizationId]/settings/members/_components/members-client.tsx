'use client'

import { useState } from "react"
import { Check, Clock, Crown, MoreHorizontal, Plus, Send, Shield, ShieldAlert, UserPlus, X } from "lucide-react"
import { MemberRole } from "@prisma/client"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { inviteMember, resendInvitation, cancelInvitation } from "@/actions/invite-member"
import { changeMemberRole, removeMember } from "@/actions/manage-member"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { canPerformAction } from "@/lib/rbac"

// Tipos de dados
interface Member {
  id: string
  userId: string
  name: string
  email: string
  role: MemberRole
  image?: string | null
  joinedAt: string
}

interface Invitation {
  id: string
  email: string
  role: MemberRole
  sentAt: string
  expiresAt: string
}

interface MembersClientProps {
  organizationId: string
  members: Member[]
  invitations: Invitation[]
  currentUserRole: MemberRole
}

// Funções disponíveis para a organização
const roles = [
  { value: "OWNER", label: "PROPRIETÁRIO", icon: Crown },
  { value: "ADMIN", label: "ADMINISTRADOR", icon: ShieldAlert },
  { value: "MEMBER", label: "MEMBRO", icon: Shield },
]

// Função para obter as iniciais de um nome
const getInitials = (name: string): string => {
  if (!name) return "?";
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Função para obter cor de fundo baseada no nome
const getAvatarColor = (name: string): string => {
  const colors = [
    "bg-blue-500", "bg-indigo-500", "bg-purple-500", 
    "bg-pink-500", "bg-red-500", "bg-orange-500", 
    "bg-amber-500", "bg-yellow-500", "bg-lime-500", 
    "bg-green-500", "bg-emerald-500", "bg-teal-500", 
    "bg-cyan-500", "bg-sky-500", "bg-violet-500"
  ];
  
  if (!name) return colors[0];
  
  // Usar a soma dos códigos de caractere como seed para escolher uma cor
  const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[charSum % colors.length];
};

export function MembersClient({ organizationId, members, invitations, currentUserRole }: MembersClientProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState(roles[2])

  // Verificar permissões
  const canInviteMembers = canPerformAction(currentUserRole, 'member:invite')
  const canManageMembers = canPerformAction(currentUserRole, 'member:update') || canPerformAction(currentUserRole, 'member:remove')
  const canViewMembers = canPerformAction(currentUserRole, 'member:view')
  const isOwner = currentUserRole === "OWNER"
  
  // Verificar se já existe um proprietário na organização
  const hasOwner = members.some(member => member.role === "OWNER")

  const handleInvite = async () => {
    if (!email) {
      toast.error("Por favor, insira um endereço de email")
      return
    }

    setIsLoading(true)

    try {
      const result = await inviteMember({ 
        email, 
        organizationId, 
        role: selectedRole.value as MemberRole 
      })

      if (result.error) {
        throw new Error(result.error)
      }

      toast.success(`Convite enviado para ${email}`)
      setEmail("")
      router.refresh()
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao enviar convite')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    setIsLoading(true)
    
    try {
      const result = await resendInvitation(invitationId)

      if (result.error) {
        throw new Error(result.error)
      }

      toast.success("Convite reenviado com sucesso")
      router.refresh()
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao reenviar convite')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    setIsLoading(true)
    
    try {
      const result = await cancelInvitation(invitationId)

      if (result.error) {
        throw new Error(result.error)
      }

      toast.success("Convite cancelado com sucesso")
      router.refresh()
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao cancelar convite')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async (membershipId: string) => {
    setIsLoading(true)
    
    try {
      const result = await removeMember({ membershipId })

      if (result.error) {
        throw new Error(result.error)
      }

      toast.success("Membro removido com sucesso")
      router.refresh()
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao remover membro')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleChangeRole = async (membershipId: string, role: MemberRole) => {
    setIsLoading(true)
    
    try {
      const result = await changeMemberRole({ membershipId, role })

      if (result.error) {
        throw new Error(result.error)
      }

      toast.success(`Função alterada para ${role}`)
      router.refresh()
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao alterar função')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleBadge = (role: MemberRole) => {
    switch (role) {
      case "OWNER":
        return (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-medium">
            <Crown className="h-2.5 w-2.5" />
            PROPRIETÁRIO
          </div>
        )
      case "ADMIN":
        return (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-medium">
            <ShieldAlert className="h-2.5 w-2.5" />
            ADMINISTRADOR
          </div>
        )
      case "MEMBER":
        return (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
            <Shield className="h-2.5 w-2.5" />
            MEMBRO
          </div>
        )
      default:
        return <span>{role}</span>
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString
    }
  }

  return (
    <div className="space-y-4">
      {/* Seção de convite - só exibir se o usuário tiver permissão */}
      {canInviteMembers && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2 space-y-1">
            <CardTitle className="text-base font-medium">Convidar novos membros</CardTitle>
            <CardDescription className="text-xs">Envie convites para novos membros da equipe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Endereço de email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-9 text-sm"
                disabled={isLoading}
              />
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between w-full sm:w-[180px] h-9 text-sm"
                    disabled={isLoading}
                  >
                    {selectedRole.label}
                    <Check className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar função..." className="h-9 text-sm" />
                    <CommandList>
                      <CommandEmpty>Nenhuma função encontrada.</CommandEmpty>
                      <CommandGroup>
                        {roles.map((role) => (
                          <CommandItem
                            key={role.value}
                            value={role.value}
                            onSelect={() => {
                              setSelectedRole(role)
                              setOpen(false)
                            }}
                            className="text-sm"
                          >
                            <role.icon className="mr-2 h-4 w-4" />
                            {role.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Button 
                onClick={handleInvite} 
                className="h-9 text-sm"
                disabled={isLoading}
              >
                <Send className="h-4 w-4 mr-2" />
                Convidar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Abas para Membros e Convites */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full max-w-[300px] grid-cols-2 h-10">
          <TabsTrigger value="members" className="text-sm">
            Membros ({members.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" className="text-sm">
            Convites ({invitations.length})
          </TabsTrigger>
        </TabsList>

        {/* Aba de Membros */}
        <TabsContent value="members" className="mt-3">
          <Card>
            <CardContent className="pt-6">
              {!canViewMembers ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-base font-medium mb-2">Acesso restrito</h3>
                  <p className="text-sm text-muted-foreground mb-4">Você não tem permissão para visualizar os membros da organização.</p>
                </div>
              ) : members.length > 0 ? (
                <div className="rounded-md border border-border overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 p-3 bg-muted text-sm font-medium text-muted-foreground border-b border-border">
                    <div className="col-span-5 sm:col-span-6">Membro</div>
                    <div className="col-span-3 sm:col-span-2 text-center">Função</div>
                    <div className="col-span-3 sm:col-span-3 hidden sm:block">Entrada</div>
                    {canManageMembers && (
                      <div className="col-span-1 text-right"></div>
                    )}
                  </div>

                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="grid grid-cols-12 gap-2 p-3 items-center border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <div className="col-span-5 sm:col-span-6 flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={member.image || ""} 
                            alt={member.name} 
                          />
                          <AvatarFallback className={cn(getAvatarColor(member.name))}>
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{member.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                        </div>
                      </div>
                      <div className="col-span-3 sm:col-span-2 flex justify-center">
                        {getRoleBadge(member.role)}
                      </div>
                      <div className={`col-span-${canManageMembers ? '3' : '4'} hidden sm:block text-xs text-muted-foreground`}>
                        {formatDate(member.joinedAt)}
                      </div>
                      {canManageMembers && (
                        <div className="col-span-1 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isLoading}>
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel className="text-xs">Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {isOwner && (!hasOwner || member.role === "OWNER") && (
                                <DropdownMenuItem
                                  onClick={() => handleChangeRole(member.id, "OWNER")}
                                  className="text-xs"
                                  disabled={isLoading || member.role === "OWNER"}
                                >
                                  <Crown className="mr-2 h-4 w-4" />
                                  Tornar PROPRIETÁRIO
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleChangeRole(member.id, "ADMIN")}
                                className="text-xs"
                                disabled={isLoading || member.role === "ADMIN"}
                              >
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                Tornar ADMINISTRADOR
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleChangeRole(member.id, "MEMBER")}
                                className="text-xs"
                                disabled={isLoading || member.role === "MEMBER"}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Tornar MEMBRO
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 dark:text-red-400 text-xs"
                                onClick={() => handleRemoveMember(member.id)}
                                disabled={isLoading}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Remover Membro
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                    <UserPlus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-medium mb-2">Nenhum membro ainda</h3>
                  <p className="text-sm text-muted-foreground mb-4">Convide membros para colaborar</p>
                  {canInviteMembers && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="inline-flex items-center text-sm h-9"
                      onClick={() => document.querySelector("input")?.focus()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar primeiro membro
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Convites */}
        <TabsContent value="invitations" className="mt-3">
          <Card>
            <CardContent className="pt-6">
              {invitations.length > 0 ? (
                <div className="rounded-md border border-border overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 p-3 bg-muted text-sm font-medium text-muted-foreground border-b border-border">
                    <div className="col-span-5 sm:col-span-6">Email</div>
                    <div className="col-span-3 sm:col-span-2 text-center">Função</div>
                    <div className="col-span-3 sm:col-span-3 hidden sm:block">Enviado</div>
                    {canManageMembers && (
                      <div className="col-span-1 text-right"></div>
                    )}
                  </div>

                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="grid grid-cols-12 gap-2 p-3 items-center border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <div className="col-span-5 sm:col-span-6 flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            <Clock className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{invitation.email}</p>
                          <p className="text-xs text-muted-foreground truncate">Aguardando aceitação</p>
                        </div>
                      </div>
                      <div className="col-span-3 sm:col-span-2 flex justify-center">
                        {getRoleBadge(invitation.role)}
                      </div>
                      <div className={`col-span-${canManageMembers ? '3' : '4'} hidden sm:block text-xs text-muted-foreground`}>
                        {formatDate(invitation.sentAt)}
                      </div>
                      {canManageMembers && (
                        <div className="col-span-1 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isLoading}>
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel className="text-xs">Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleResendInvitation(invitation.id)} 
                                className="text-xs"
                                disabled={isLoading}
                              >
                                <Send className="mr-2 h-4 w-4" />
                                Reenviar Convite
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 dark:text-red-400 text-xs"
                                onClick={() => handleCancelInvitation(invitation.id)}
                                disabled={isLoading}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Cancelar Convite
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-medium mb-2">Nenhum convite pendente</h3>
                  <p className="text-sm text-muted-foreground mb-4">Todos os convites foram aceitos ou cancelados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}