import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getUserOrganizations, getOrganizationById } from '@/actions/organization';
import { Organization } from '@/types/organization';
import { toast } from 'sonner';

const ORGANIZATIONS_CACHE_KEY = 'organizations_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

interface CachedOrganizations {
  organizations: Organization[];
  activeOrganization: Organization | null;
  timestamp: number;
}

export function useOptimizedOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganization, setActiveOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams<{ organizationId?: string }>();

  // Função para buscar as organizações do usuário
  const fetchOrganizations = useCallback(async (force = false) => {
    try {
      // Verificar cache primeiro
      const cached = localStorage.getItem(ORGANIZATIONS_CACHE_KEY);
      if (cached && !force) {
        const { organizations: cachedOrgs, activeOrganization: cachedActive, timestamp } = JSON.parse(cached) as CachedOrganizations;
        const now = Date.now();
        
        if (now - timestamp < CACHE_DURATION) {
          setOrganizations(cachedOrgs);
          setActiveOrganization(cachedActive);
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(true);
      const result = await getUserOrganizations();

      if (!result) {
        toast.error('Erro ao carregar organizações');
        return;
      }

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success && result.organizations) {
        const orgs = result.organizations as Organization[];
        setOrganizations(orgs);
        
        let activeOrg: Organization | null = null;
        
        // Se tiver um ID na rota, busca a organização pelo ID
        if (params.organizationId) {
          const orgResult = await getOrganizationById(params.organizationId);
          
          if (orgResult && orgResult.success && orgResult.organization) {
            activeOrg = orgResult.organization as Organization;
            setActiveOrganization(activeOrg);
          } else if (orgs.length > 0) {
            activeOrg = orgs[0];
            setActiveOrganization(activeOrg);
          }
        } else if (orgs.length > 0) {
          activeOrg = orgs[0];
          setActiveOrganization(activeOrg);
        }

        // Atualizar cache
        localStorage.setItem(ORGANIZATIONS_CACHE_KEY, JSON.stringify({
          organizations: orgs,
          activeOrganization: activeOrg,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar organizações:', error);
      toast.error('Erro ao carregar suas organizações');
    } finally {
      setIsLoading(false);
    }
  }, [params.organizationId]);

  // Ao montar o componente, busca as organizações
  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Ao mudar o ID na URL, atualiza a organização ativa
  useEffect(() => {
    if (params.organizationId && organizations.length > 0) {
      const org = organizations.find(org => org.id === params.organizationId);
      if (org && (!activeOrganization || activeOrganization.id !== params.organizationId)) {
        setActiveOrganization(org);
        
        // Atualizar cache
        const cached = localStorage.getItem(ORGANIZATIONS_CACHE_KEY);
        if (cached) {
          const { organizations: cachedOrgs, timestamp } = JSON.parse(cached) as CachedOrganizations;
          localStorage.setItem(ORGANIZATIONS_CACHE_KEY, JSON.stringify({
            organizations: cachedOrgs,
            activeOrganization: org,
            timestamp
          }));
        }
      }
    }
  }, [params.organizationId, organizations, activeOrganization]);

  return {
    organizations,
    activeOrganization,
    setActiveOrganization,
    isLoading,
    refreshOrganizations: () => fetchOrganizations(true)
  };
} 