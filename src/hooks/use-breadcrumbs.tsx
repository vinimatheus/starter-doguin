'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { useOrganizationContext } from '@/providers/organization-provider';

type BreadcrumbItem = {
  title: string;
  link: string;
};

const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ title: 'Dashboard', link: '/dashboard/overview' }]
};

export function useBreadcrumbs() {
  const pathname = usePathname();
  const { activeOrganization } = useOrganizationContext();

  const breadcrumbs = useMemo(() => {
    if (routeMapping[pathname]) {
      return routeMapping[pathname];
    }

    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      
      // Verificar se o segmento é um ID de organização
      if (activeOrganization && activeOrganization.id === segment) {
        return {
          title: activeOrganization.name,
          link: path
        };
      }
      
      // Personalizar os títulos para alguns segmentos específicos
      if (segment === 'settings') {
        return {
          title: 'Configurações',
          link: path
        };
      }
      
      if (segment === 'members') {
        return {
          title: 'Membros',
          link: path
        };
      }
      
      if (segment === 'profile') {
        return {
          title: 'Perfil',
          link: path
        };
      }
      
      if (segment === 'organization') {
        return {
          title: 'Organização',
          link: path
        };
      }
      
      if (segment === 'overview') {
        return {
          title: 'Visão Geral',
          link: path
        };
      }
      
      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        link: path
      };
    });
  }, [pathname, activeOrganization]);

  return breadcrumbs;
}
