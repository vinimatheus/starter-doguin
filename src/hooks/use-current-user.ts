import { useOptimizedSession } from './use-optimized-session';

export const useCurrentUser = () => {
  const { data: session, status } = useOptimizedSession();

  if (status === 'loading') {
    return null;
  }

  return session?.user || null;
};
