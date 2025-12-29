import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Obtenemos la cookie de sesión de NextAuth
  // Nota: En producción suele llamarse __Secure-next-auth.session-token, en local next-auth.session-token
  const sessionToken = request.cookies.get('next-auth.session-token') || request.cookies.get('__Secure-next-auth.session-token');

  const { pathname } = request.nextUrl;

  // 1. Rutas Públicas: Login, Tracking y APIs necesarias
  // Si intenta entrar al tracking o al login, lo dejamos pasar
  if (pathname.startsWith('/login') || pathname.startsWith('/tracking') || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 2. Protección: Si no tiene token y quiere entrar al Dashboard (/)
  if (!sessionToken) {
    // Lo redirigimos al login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Configuramos en qué rutas se ejecuta este middleware (en casi todas)
export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};