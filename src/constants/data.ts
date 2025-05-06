import { NavItem } from '@/types';

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/[organizationId]/overview',
    icon: 'dashboard',
    org: true,
    isActive: false,
    items: []
  },
  {
    title: 'Configurações',
    url: '/dashboard/[organizationId]/settings/profile',
    icon: 'settings',
    org: true,
    isActive: false,
    items: []
  },
];
