/**
 * Uma lista de rotas que são acessíveis a todos
 * Essas rotas não requerem autenticação
 * @type {string[]}
 */
export const publicRoutes: string[] = [
  "/",
  "/auth/new-verification"
];

/**
 * Uma lista de rotas que são usadas para autenticação
 * Essas rotas redirecionarão usuários logados para /selecionar-organizacao
 * @type {string[]}
 */
export const authRoutes: string[] = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/reset",
  "/auth/new-password",
];

/**
 * O prefixo para as rotas da API de autenticação
 * Rotas que começam com este prefixo são usadas para API authentication
 * @type {string}
 */
export const apiAuthPrefix: string = "/api/auth";

/**
 * Rota padrão de redirecionamento após login
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT: string = "/select-organization";
