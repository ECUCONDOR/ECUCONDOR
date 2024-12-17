import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request as any });
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/register');

  // Si el usuario está autenticado y trata de acceder a páginas de auth
  if (token && isAuthPage) {
    // Redirigir basado en el rol del usuario
    if (token.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/client/dashboard', request.url));
    }
  }

  // Proteger rutas de admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/client/dashboard', request.url));
    }
  }

  // Proteger rutas de cliente
  if (request.nextUrl.pathname.startsWith('/client')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/client/:path*',
    '/login',
    '/register'
  ]
};
