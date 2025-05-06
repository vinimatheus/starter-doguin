'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { signOut } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Building, 
  Settings, 
  CreditCard, 
  LogOut
} from 'lucide-react';
import { useOrganizationContext } from '@/providers/organization-provider';
import { canPerformAction } from '@/lib/rbac';
import { MemberRole } from '@prisma/client';
import { useOptimizedSession } from '@/hooks/use-optimized-session';

export function UserNav() {
  const { data: session, status } = useOptimizedSession();
  const params = useParams();
  const organizationId = params?.organizationId as string;
  const { activeOrganization } = useOrganizationContext();


  if (status === 'loading') {
    return (
      <div className="flex h-10 items-center justify-center">Loading...</div>
    );
  }

  if (session) {
    // Obter o papel do usuário na organização atual
    const userRole = activeOrganization?.role || MemberRole.MEMBER;
    
    // Definir quais opções o usuário pode ver com base em suas permissões
    const canManageOrg = canPerformAction(userRole, 'organization:update');
    const canManageSubscription = canPerformAction(userRole, 'subscription:view');

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={session.user?.image ?? ''}
                alt={session.user?.name ?? 'Avatar'}
              />
              <AvatarFallback>{session.user?.name?.[0] ?? 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col items-start space-y-1">
              <p className="text-sm font-medium leading-none text-primary">
                {session.user?.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user?.email}
              </p>
              <div className="flex w-full justify-end">

                {activeOrganization?.role && (
                  <Badge variant="outline" className="mt-2">
                    {activeOrganization.role}
                  </Badge>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-2" />
          
          <Link href={`/dashboard/${organizationId}/settings/profile`} className="w-full">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
          </Link>
          
          {canManageOrg && (
            <Link href={`/dashboard/${organizationId}/settings/organization`} className="w-full">
              <DropdownMenuItem>
                <Building className="mr-2 h-4 w-4" />
                <span>Organização</span>
              </DropdownMenuItem>
            </Link>
          )}
          
          <Link href={`/dashboard/${organizationId}/settings/preferences`} className="w-full">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Preferências</span>
            </DropdownMenuItem>
          </Link>
          
          {canManageSubscription && (
            <Link href={`/dashboard/${organizationId}/settings/subscription`} className="w-full">
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Assinatura</span>
              </DropdownMenuItem>
            </Link>
          )}
          
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuItem
            className="flex cursor-pointer items-center justify-between gap-4 text-destructive"
            onClick={() => signOut()}
          >
            <div className="flex items-center">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </div>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return null;
}
