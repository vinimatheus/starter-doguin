import { Icons } from '@/components/icons';

export interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  org: boolean;
  shortcut?: [string, string];
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  isActive?: boolean;
  items?: NavItem[];
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

export interface Product {
  id: string;
  productCode: number;
  model: string;
  size: string | null;
  portalDescription: string | null;
  totalStock: number;
  category: string;
  portalDesc: string | null;
  productLine: string;
  imageCount: number;
  primaryPackageQty: number | null;
  description: string;
  modelCode: string | null;
  closedLength: string | null;
  price: number | null;
  closedWidth: string | null;
  primaryPackageWeight: string | null;
  closedDepth: string | null;
  primaryPackageType: string | null;
  paperType: string | null;
  packagingType: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductFormValues = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

export type ProductTableItem = Product;
