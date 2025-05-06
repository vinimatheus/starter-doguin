import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';

const SESSION_CACHE_KEY = 'session_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

import type { Session } from 'next-auth';

interface CachedSession {
  data: Session;
  timestamp: number;
}

export function useOptimizedSession() {
  const { data: session, status } = useSession();
  const cacheRef = useRef<CachedSession | null>(null);

  useEffect(() => {
    if (session) {
      const cachedData: CachedSession = {
        data: session,
        timestamp: Date.now()
      };
      cacheRef.current = cachedData;
      localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(cachedData));
    }
  }, [session]);

  // Se não houver sessão ativa, tenta usar o cache
  if (!session && cacheRef.current) {
    const now = Date.now();
    if (now - cacheRef.current.timestamp < CACHE_DURATION) {
      return {
        data: cacheRef.current.data,
        status: 'authenticated'
      };
    }
  }

  return { data: session, status };
} 