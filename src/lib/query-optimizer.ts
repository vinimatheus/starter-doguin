import { PERFORMANCE_CONFIG } from '@/app/config'

// Cache para queries frequentes
const queryCache = new Map<string, { data: unknown, timestamp: number }>()

// Função para limpar cache antigo
const cleanupCache = () => {
  const now = Date.now()
  for (const [key, value] of queryCache.entries()) {
    if (now - value.timestamp > PERFORMANCE_CONFIG.IDLE_TIMEOUT) {
      queryCache.delete(key)
    }
  }
}

// Executar limpeza do cache periodicamente
setInterval(cleanupCache, PERFORMANCE_CONFIG.IDLE_TIMEOUT)

// Função para otimizar queries
export async function optimizeQuery<T>(
  query: () => Promise<T>,
  cacheKey: string,
  options: {
    useCache?: boolean
    cacheTime?: number
    // Removing the select option since it's unused and has type issues
  } = {}
) {
  const {
    useCache = true,
    cacheTime = PERFORMANCE_CONFIG.IDLE_TIMEOUT
    // select is unused
  } = options

  // Se cache estiver habilitado, verificar cache primeiro
  if (useCache) {
    const cached = queryCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data as T
    }
  }

  // Executar query
  const result = await query()

  // Atualizar cache se necessário
  if (useCache) {
    queryCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    })
  }

  return result
}

// Função para otimizar queries em lote
export async function optimizeBatchQuery<T>(
  queries: Array<() => Promise<T>>,
  options: {
    batchSize?: number
  } = {}
) {
  const { batchSize = PERFORMANCE_CONFIG.BATCH_SIZE } = options
  const results: T[] = []

  // Processar queries em lotes
  for (let i = 0; i < queries.length; i += batchSize) {
    const batch = queries.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(query => query()))
    results.push(...batchResults)
  }

  return results
} 