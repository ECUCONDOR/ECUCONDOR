import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'
import type { CookieOptions } from '@supabase/ssr'
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

// Add debug logging
function log(message: string, data?: any) {
  console.log(`[Middleware] ${message}`, data ? JSON.stringify(data, null, 2) : '')
}

function redirectToError(request: NextRequest, error: any) {
  const errorDetails = typeof error === 'string' ? error : error?.message || 'Unknown error';
  const url = new URL('/error', request.url);
  const response = NextResponse.redirect(url);
  
  // Set error details in a cookie that the error page can read
  response.cookies.set({
    name: 'error_details',
    value: errorDetails,
    httpOnly: false,
    sameSite: 'strict',
    path: '/',
    maxAge: 30 // 30 seconds
  });
  
  return response;
}

const isAuthRoute = (path: string): boolean => {
  const authRoutes = ['/login', '/register', '/auth'];
  return authRoutes.some(route => path.startsWith(route));
};

const isProtectedRoute = (path: string): boolean => {
  const protectedRoutes = ['/dashboard', '/clients', '/settings'];
  return protectedRoutes.some(route => path.startsWith(route));
};

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const cookieStore = request.cookies;
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value,
            ...options as Omit<ResponseCookie, 'name' | 'value'>
          });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.delete({
            name,
            ...options as Omit<ResponseCookie, 'name'>
          });
        },
      },
    }
  );

  const path = request.nextUrl.pathname;

  try {
    log('Starting middleware check');
    
    // Allow public routes first
    if (isPublicRoute(path)) {
      log('Public route access:', { path });
      return res;
    }

    // Renovar la sesión si existe
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError) {
      log('Session error:', sessionError);
      return redirectToError(request, 'Error de autenticación: ' + sessionError.message);
    }

    // Handle unauthenticated users
    if (!session) {
      log('No session, redirecting to login');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    log('User authenticated:', { 
      userId: session.user.id,
      email: session.user.email 
    });

    // Si es una ruta protegida y no hay sesión, redirigir a login
    if (isProtectedRoute(path) && !session) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      redirectUrl.searchParams.set('redirectedFrom', path);
      return NextResponse.redirect(redirectUrl);
    }

    // Si es una ruta de auth y hay sesión, redirigir al dashboard
    if (isAuthRoute(path) && session) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    log('Middleware error:', error);
    return redirectToError(request, error);
  }
}

// Public routes that don't require authentication
function isPublicRoute(pathname: string): boolean {
  const publicPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/callback',
    '/auth/reset-password',
    '/auth/verify',
    '/error',
    '/',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
    '/faq'
  ];

  // Static files and images
  const staticExtensions = [
    '.ico',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.css',
    '.js',
    '.json',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot'
  ];

  return (
    publicPaths.some(path => pathname.startsWith(path)) ||
    staticExtensions.some(ext => pathname.endsWith(ext)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')
  );
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
