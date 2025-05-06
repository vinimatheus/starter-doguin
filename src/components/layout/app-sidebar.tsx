"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { navItems } from "@/constants/data";
import { Icons } from "@/components/icons";
import { ChevronRight } from "lucide-react";
import { OrganizationSwitcher } from "@/components/organization/organization-switcher";
import { useOrganizationContext } from "@/providers/organization-provider";
import React, { useState, useEffect, useCallback } from "react";

export default function AppSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const { activeOrganization, setActiveOrganization, organizations } = useOrganizationContext();
  const [activeItems, setActiveItems] = useState<Record<string, boolean>>({});
  const [isClient, setIsClient] = useState(false);

  // Obter o organizationId da URL ou da organização ativa
  const organizationId = params.organizationId ? params.organizationId.toString() : (activeOrganization?.id ?? '');

  // Função para verificar se um item de menu está ativo
  const isMenuItemActive = useCallback((itemUrl: string) => {
    // Verificação exata para correspondência perfeita
    if (pathname === itemUrl) return true;
    
    // Verificação de rota filha para menus expansíveis
    // Extrai os segmentos da URL
    const itemSegments = itemUrl.split('/').filter(Boolean);
    const pathnameSegments = pathname.split('/').filter(Boolean);
    
    // Se a URL atual tem mais segmentos que o item do menu
    // E todos os segmentos do item do menu estão presentes no início da URL atual
    // Consideramos que estamos em uma subrota desse item
    if (pathnameSegments.length > itemSegments.length) {
      // Verificamos se os primeiros segmentos coincidem (ou seja, se estamos em uma subrota)
      let isParentRoute = true;
      for (let i = 0; i < itemSegments.length; i++) {
        // Tratamento especial para segmentos dinâmicos [param]
        if (itemSegments[i].startsWith('[') && itemSegments[i].endsWith(']')) {
          // Pula a comparação para segmentos dinâmicos
          continue;
        }
        
        if (itemSegments[i] !== pathnameSegments[i]) {
          isParentRoute = false;
          break;
        }
      }
      
      return isParentRoute;
    }
    
    return false;
  }, [pathname]);

  // Usando useEffect para garantir que a lógica de rotas ativas só seja executada no cliente
  useEffect(() => {
    setIsClient(true);
    
    // Calcular os itens ativos
    const newActiveItems: Record<string, boolean> = {};
    
    navItems.forEach(item => {
      const itemUrl = item.url.replace("[organizationId]", organizationId);
      newActiveItems[itemUrl] = isMenuItemActive(itemUrl);
      
      if (item.items && item.items.length > 0) {
        item.items.forEach(subItem => {
          const subItemUrl = subItem.url.replace("[organizationId]", organizationId);
          newActiveItems[subItemUrl] = isMenuItemActive(subItemUrl);
        });
      }
    });
    
    setActiveItems(newActiveItems);
  }, [pathname, organizationId, isMenuItemActive]);

  // Evitar navegação com ID indefinido
  useEffect(() => {
    if (!organizationId && organizations && organizations.length > 0) {
      // Se não temos ID de organização mas temos organizações disponíveis,
      // atualizar para usar a primeira organização
      setActiveOrganization(organizations[0]);
    }
  }, [organizationId, organizations, setActiveOrganization]);

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <OrganizationSwitcher />
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            
            {navItems.map((item) => {
              const Icon = item.icon
                ? Icons[item.icon as keyof typeof Icons]
                : Icons.logo;

              // Substituir o organizationId dinâmico na URL
              const itemUrl = item.url.replace("[organizationId]", organizationId);

              // Verificar se o item está ativo usando o estado calculado no useEffect
              const isActive = isClient && activeItems[itemUrl];

              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive || isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActive}
                      >
                        {item.icon && <Icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          // Substituir o organizationId dinâmico na URL de subitens
                          const subItemUrl = subItem.url.replace("[organizationId]", organizationId);
                          
                          // Verificar se o subitem está ativo usando o estado calculado no useEffect
                          const isSubActive = isClient && activeItems[subItemUrl];

                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isSubActive}
                              >
                                <Link href={subItemUrl}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive}
                  >
                    <Link href={itemUrl}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
