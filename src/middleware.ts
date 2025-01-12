import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isPublicRoute, isAuthRoute, DEFAULT_LOGIN_REDIRECT } from '@/lib/utils/routes';

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });
    const { pathname } = req.nextUrl;

    // Verificar si es una ruta pública
    if (isPublicRoute(pathname)) {
      // Configurar headers de CORS
      res.headers.set('Access-Control-Allow-Origin', '*');
      res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res;
    }

    // Verificar la sesión
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error al verificar sesión:', error);
      // En caso de error de sesión, redirigir a login
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('error', 'session_error');
      return NextResponse.redirect(redirectUrl);
    }

    // Manejar rutas de autenticación
    if (isAuthRoute(pathname)) {
      if (session) {
        console.log('Usuario autenticado intentando acceder a ruta de auth');
        // Verificar si hay una URL de retorno
        const returnUrl = req.nextUrl.searchParams.get('returnUrl');
        const redirectUrl = new URL(returnUrl || DEFAULT_LOGIN_REDIRECT, req.url);
        return NextResponse.redirect(redirectUrl);
      }
      return res;
    }

    // Proteger rutas privadas
    if (!session) {
      console.log('Acceso no autorizado a ruta protegida:', pathname);
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      
      const encodedFrom = encodeURIComponent(from);
      const redirectUrl = new URL(`/login?from=${encodedFrom}`, req.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Añadir información de usuario al request
    res.headers.set('x-user-id', session.user.id);
    res.headers.set('x-user-role', session.user.role || 'user');

    // Configurar headers de CORS
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return res;
  } catch (error) {
    console.error('Error crítico en middleware:', error);
    // En caso de error, redirigir a login
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('error', 'session_error');
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/auth/:path*'
  ]
};
