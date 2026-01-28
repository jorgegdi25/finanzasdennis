import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'finanzas_session'

/**
 * Middleware de protección de rutas
 * 
 * Protege rutas privadas y redirige según el estado de sesión:
 * - Rutas protegidas (/dashboard/*): Requieren sesión válida
 * - Ruta de login (/login): Redirige a dashboard si ya hay sesión
 * 
 * Nota: En middleware debemos leer cookies directamente del request
 * porque no podemos usar cookies() de next/headers aquí
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Leer cookie de sesión directamente del request
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)
  const hasSession = !!sessionCookie?.value

  // Ruta de login: si ya hay sesión, redirigir a dashboard
  if (pathname === '/login') {
    if (hasSession) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Rutas protegidas: si no hay sesión, redirigir a login
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/accounts')) {
    if (!hasSession) {
      const loginUrl = new URL('/login', request.url)
      // Guardar la URL original para redirigir después del login
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

// Configuración de rutas donde se ejecuta el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
