// Configurações de cache e performance
export const CACHE_CONFIG = {
  // Tempo de cache para dados estáticos (5 minutos)
  STATIC_CACHE: 300,
  // Tempo de cache para dados dinâmicos (1 minuto)
  DYNAMIC_CACHE: 60,
  // Tempo de cache para dados de usuário (5 minutos)
  USER_CACHE: 300,
  // Tempo de cache para dados de organização (5 minutos)
  ORGANIZATION_CACHE: 300
}

// Configurações de rotas
export const ROUTE_CONFIG = {
  // Rotas que não precisam de autenticação
  PUBLIC_ROUTES: [
    '/auth/login',
    '/auth/register',
    '/auth/error',
    '/auth/force-logout'
  ],
  // Rotas que precisam de autenticação
  PROTECTED_ROUTES: [
    '/dashboard',
    '/create-organization',
    '/select-organization'
  ],
  // Rotas que precisam de verificação de organização
  ORGANIZATION_ROUTES: [
    '/dashboard/[organizationId]'
  ]
}

// Configurações de performance
export const PERFORMANCE_CONFIG = {
  // Tamanho máximo do pool de conexões
  MAX_CONNECTIONS: 10,
  // Tempo máximo de idle para conexões
  IDLE_TIMEOUT: 30000,
  // Tempo máximo para adquirir conexão
  ACQUIRE_TIMEOUT: 30000,
  // Tamanho do batch para operações em lote
  BATCH_SIZE: 100
} 