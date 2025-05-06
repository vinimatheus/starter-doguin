"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Building } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useOrganizationContext } from "@/providers/organization-provider"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { CreateOrganizationForm } from "./create-organization-form"
import { Organization } from '@/types/organization'

export function OrganizationSwitcher() {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { organizations, activeOrganization, setActiveOrganization, isLoading } = useOrganizationContext()
  const [openDialog, setOpenDialog] = React.useState(false)

  const handleOrganizationChange = (org: Organization) => {
    setActiveOrganization(org)
    router.push(`/dashboard/${org.id}/overview`)
  }

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-muted text-sidebar-muted-foreground">
              <Building className="size-4 animate-pulse" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="h-4 w-24 animate-pulse rounded bg-sidebar-muted"></span>
              <span className="h-3 w-16 animate-pulse rounded bg-sidebar-muted"></span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (!activeOrganization && organizations.length === 0) {
    return (
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <SidebarMenu>
          <SidebarMenuItem>
            <DialogTrigger asChild>
              <SidebarMenuButton size="lg">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Plus className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Criar Organização
                  </span>
                  <span className="truncate text-xs">Comece aqui</span>
                </div>
              </SidebarMenuButton>
            </DialogTrigger>
          </SidebarMenuItem>
        </SidebarMenu>
        <CreateOrganizationForm open={openDialog} onOpenChange={setOpenDialog} />
      </Dialog>
    )
  }

  if (!activeOrganization) {
    return null
  }

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Building className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {activeOrganization.name}
                  </span>
                  <span className="truncate text-xs capitalize">
                    {activeOrganization.role.toLowerCase()}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Suas Organizações
              </DropdownMenuLabel>
              {organizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => handleOrganizationChange(org)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                      <Building className="size-4 shrink-0" />
                  </div>
                  {org.name}
                  {org.id === activeOrganization.id && (
                    <span className="ml-auto text-xs text-primary">Ativo</span>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DialogTrigger asChild>
                <DropdownMenuItem className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">Nova Organização</div>
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <CreateOrganizationForm open={openDialog} onOpenChange={setOpenDialog} />
    </Dialog>
  )
} 