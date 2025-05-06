import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { JWT } from 'next-auth/jwt'

// Cache para tokens válidos (TTL de 5 minutos)
const tokenCache = new Map<string, { token: JWT | null, timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos em milissegundos

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  try {
    // Verificar se é uma rota que precisa de autenticação
    const isProtectedRoute = (
      pathname.startsWith('/dashboard') || 
      pathname === '/create-organization' || 
      pathname === '/select-organization'
    )

    // Se não for rota protegida, permite o acesso
    if (!isProtectedRoute) {
      return NextResponse.next()
    }

    // Verificar cache do token
    const cachedToken = tokenCache.get(request.cookies.toString())
    const now = Date.now()
    
    if (cachedToken && (now - cachedToken.timestamp) < CACHE_TTL) {
      // Usar token do cache
      const token = cachedToken.token
      
      // Redirecionamento baseado no estado de autenticação
      if (pathname === '/') {
        return NextResponse.redirect(
          new URL(token?.isValid !== false ? '/select-organization' : '/auth/login', request.url)
        )
      } else if (pathname.startsWith('/auth/') && !pathname.startsWith('/auth/force-logout') && token?.isValid !== false) {
        return NextResponse.redirect(new URL('/select-organization', request.url))
      }
      
      return NextResponse.next()
    }

    // Obter o token de autenticação
    const token = await getToken({ 
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    })

    // Atualizar cache
    tokenCache.set(request.cookies.toString(), { token, timestamp: now })

    // Verificar autenticação
    const isAuthenticated = !!token && token?.isValid !== false
    const isTokenInvalid = !!token && token?.isValid === false

    // Redirecionar se token inválido
    if (isTokenInvalid && 
        !pathname.startsWith('/auth/login') && 
        !pathname.startsWith('/auth/force-logout')) {
      const message = Buffer.from('Usuário não encontrado no sistema').toString('base64')
      return NextResponse.redirect(
        new URL(`/auth/force-logout?reason=${message}`, request.url)
      )
    }

    // Redirecionamento baseado no estado de autenticação
    if (pathname === '/') {
      return NextResponse.redirect(
        new URL(isAuthenticated ? '/select-organization' : '/auth/login', request.url)
      )
    } else if (isProtectedRoute && !isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    } else if (
      pathname.startsWith('/auth/') &&
      !pathname.startsWith('/auth/force-logout') &&
      isAuthenticated
    ) {
      return NextResponse.redirect(new URL('/select-organization', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Erro na autenticação:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
}
